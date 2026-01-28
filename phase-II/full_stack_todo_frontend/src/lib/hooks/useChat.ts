import { useState, useCallback } from 'react';
import apiClient from '@/lib/api/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTasks } from '@/lib/hooks/useTasks';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseChatReturn {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

export function useChat(): UseChatReturn {
  const { user } = useAuth();
  const { createTask, updateTask, deleteTask, tasks } = useTasks();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    setLoading(true);
    setError(null);

    try {
      // Send to backend
      const response = await apiClient.post('/chat', {
        messages: [...messages, userMessage].map(m => ({
          role: m.role,
          content: m.content
        })),
        user_id: user.id
      });

      const { message, function_call } = response.data;

      // Execute function if requested
      if (function_call) {
        const { name, arguments: args } = function_call;
        let result = '';

        try {
          switch (name) {
            case 'create_task':
              const newTask = await createTask({
                title: args.title,
                description: args.description || ''
              });
              result = `✅ Task created: "${newTask.title}"`;
              break;

            case 'update_task':
              const updatedTask = await updateTask(args.task_id, {
                title: args.title,
                description: args.description,
                is_completed: args.is_completed
              });
              result = `✅ Task updated: "${updatedTask.title}"`;
              break;

            case 'delete_task':
              await deleteTask(args.task_id);
              result = `✅ Task deleted successfully`;
              break;

            case 'list_tasks':
              if (tasks.length === 0) {
                result = 'You have no tasks yet.';
              } else {
                result = `You have ${tasks.length} task(s):\n` +
                  tasks.map(t => `• "${t.title}" (ID: ${t.id})${t.is_completed ? ' ✓' : ''}`).join('\n') +
                  '\n\nTo update or delete a task, use the ID shown in parentheses.';
              }
              break;

            default:
              result = 'Unknown function';
          }

          // Add assistant response with function result
          const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: result,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, assistantMessage]);

        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Operation failed';
          const errorMessage: ChatMessage = {
            role: 'assistant',
            content: `❌ Error: ${errorMsg}`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      } else if (message) {
        // Regular text response
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }

    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMsg);

      // Add error message to chat
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMsg}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [user, messages, createTask, updateTask, deleteTask, tasks]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearMessages
  };
}
