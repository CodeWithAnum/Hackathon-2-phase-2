"""Chat API endpoint for AI assistant."""
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import httpx
import json

from src.api.dependencies.auth import get_current_user, TokenUser
from src.config import settings


router = APIRouter()


class ChatMessage(BaseModel):
    """Chat message model."""
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    """Chat request model."""
    messages: list[ChatMessage]
    user_id: str


class FunctionCall(BaseModel):
    """Function call model."""
    name: str
    arguments: dict


class ChatResponse(BaseModel):
    """Chat response model."""
    message: str
    function_call: Optional[FunctionCall] = None


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: TokenUser = Depends(get_current_user),
):
    """Chat with AI assistant.

    The assistant can help with task management and answer questions
    about the todo app. It uses function calling to execute task operations.

    Requires authentication. The authenticated user's ID must match
    the user_id in the request.
    """
    # Verify user_id matches authenticated user
    try:
        request_user_id = UUID(request.user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "INVALID_USER_ID",
                "message": "Invalid user_id format",
                "details": {"user_id": request.user_id},
            },
        )

    if current_user.user_id != request_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "FORBIDDEN",
                "message": "Cannot chat on behalf of other users",
                "details": {"requested_user_id": request.user_id},
            },
        )

    # Get Groq API key from settings
    groq_api_key = settings.groq_api_key
    if not groq_api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "CONFIGURATION_ERROR",
                "message": "AI service not configured. Please contact administrator.",
                "details": None,
            },
        )

    # System prompt with function definitions
    system_prompt = """You are a helpful assistant for a todo app. You can:
- Create tasks (title and optional description)
- Update tasks (modify title, description, or completion status)
- Delete tasks
- List and search tasks
- Answer questions about the todo app

IMPORTANT: To update or delete a task, you MUST first call list_tasks to get the task ID (a UUID).
Never use the task title as the task_id - always use the actual ID returned by list_tasks.

When the user asks to create, update, or delete a task, use the appropriate function.
Be concise and friendly. Always confirm what action you're taking."""

    # Function definitions for Groq (OpenAI-compatible format)
    functions = [
        {
            "name": "create_task",
            "description": "Create a new task",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "Task title"},
                    "description": {"type": "string", "description": "Task description (optional)"}
                },
                "required": ["title"]
            }
        },
        {
            "name": "update_task",
            "description": "Update an existing task. You must first call list_tasks to get the task ID.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {"type": "string", "description": "Task UUID (get this from list_tasks, NOT the task title)"},
                    "title": {"type": "string", "description": "New title (optional)"},
                    "description": {"type": "string", "description": "New description (optional)"},
                    "is_completed": {"type": "boolean", "description": "Completion status (optional)"}
                },
                "required": ["task_id"]
            }
        },
        {
            "name": "delete_task",
            "description": "Delete a task. You must first call list_tasks to get the task ID.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {"type": "string", "description": "Task UUID to delete (get this from list_tasks, NOT the task title)"}
                },
                "required": ["task_id"]
            }
        },
        {
            "name": "list_tasks",
            "description": "List all tasks for the user. Returns task IDs that can be used for update_task and delete_task.",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    ]

    # Build messages for Groq
    messages = [{"role": "system", "content": system_prompt}]
    messages.extend([{"role": m.role, "content": m.content} for m in request.messages])

    # Call Groq API
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {groq_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": messages,
                    "functions": functions,
                    "temperature": 0.7,
                    "max_tokens": 500
                },
                timeout=30.0
            )

            if response.status_code != 200:
                error_detail = response.text
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail={
                        "code": "AI_SERVICE_ERROR",
                        "message": "AI service returned an error",
                        "details": {"status_code": response.status_code, "error": error_detail},
                    },
                )

            result = response.json()
            choice = result["choices"][0]

            # Debug logging
            print(f"DEBUG - Groq response: {json.dumps(choice['message'], indent=2)}")

            # Check if tool calls were made (new format)
            if "tool_calls" in choice["message"] and choice["message"]["tool_calls"]:
                # Get the first tool call
                tool_call = choice["message"]["tool_calls"][0]
                function_data = tool_call["function"]

                chat_response = ChatResponse(
                    message=choice["message"].get("content") or "",
                    function_call=FunctionCall(
                        name=function_data["name"],
                        arguments=json.loads(function_data["arguments"]) if function_data["arguments"] and function_data["arguments"] != "null" else {}
                    )
                )
                print(f"DEBUG - Returning tool call: {function_data['name']}")
                return chat_response

            # Check if function call was made (old format - for backwards compatibility)
            elif "function_call" in choice["message"]:
                function_call = choice["message"]["function_call"]
                chat_response = ChatResponse(
                    message=choice["message"].get("content") or "",
                    function_call=FunctionCall(
                        name=function_call["name"],
                        arguments=json.loads(function_call["arguments"])
                    )
                )
                print(f"DEBUG - Returning function call: {function_call['name']}")
                return chat_response

            # Return regular message response
            message_content = choice["message"].get("content") or ""
            print(f"DEBUG - Returning message: {message_content[:100]}")
            return ChatResponse(
                message=message_content,
                function_call=None
            )

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail={
                "code": "AI_SERVICE_TIMEOUT",
                "message": "AI service request timed out. Please try again.",
                "details": None,
            },
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={
                "code": "AI_SERVICE_UNAVAILABLE",
                "message": "Could not connect to AI service",
                "details": {"error": str(e)},
            },
        )
    except Exception as e:
        # Log the error for debugging
        print(f"Unexpected error in chat endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred",
                "details": None,
            },
        )
