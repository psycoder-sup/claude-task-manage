import { describe, it, expect } from 'vitest';
import { TaskSchema, TodoSchema } from './types.js';

describe('TodoSchema', () => {
  it('validates a complete todo', () => {
    const todo = {
      id: 'td_abc123',
      content: 'Setup routes',
      completed: false,
    };

    const result = TodoSchema.safeParse(todo);
    expect(result.success).toBe(true);
  });

  it('rejects todo without content', () => {
    const todo = {
      id: 'td_abc123',
      completed: false,
    };

    const result = TodoSchema.safeParse(todo);
    expect(result.success).toBe(false);
  });
});

describe('TaskSchema', () => {
  it('validates a complete task with todos', () => {
    const task = {
      id: 't_abc123',
      name: 'Test task',
      description: 'A test task description',
      status: 'TODO',
      todos: [
        { id: 'td_1', content: 'First item', completed: false },
      ],
      createdAt: '2024-01-07T10:00:00Z',
      updatedAt: '2024-01-07T10:00:00Z',
    };

    const result = TaskSchema.safeParse(task);
    expect(result.success).toBe(true);
  });

  it('validates task with optional planPath', () => {
    const task = {
      id: 't_abc123',
      name: 'Test task',
      description: 'A test task description',
      status: 'INPROGRESS',
      planPath: '~/.claude/plans/test.md',
      todos: [],
      createdAt: '2024-01-07T10:00:00Z',
      updatedAt: '2024-01-07T10:00:00Z',
    };

    const result = TaskSchema.safeParse(task);
    expect(result.success).toBe(true);
  });

  it('rejects task with invalid status', () => {
    const task = {
      id: 't_abc123',
      name: 'Test task',
      description: 'A test task description',
      status: 'INVALID',
      todos: [],
      createdAt: '2024-01-07T10:00:00Z',
      updatedAt: '2024-01-07T10:00:00Z',
    };

    const result = TaskSchema.safeParse(task);
    expect(result.success).toBe(false);
  });

  it('rejects task without required description', () => {
    const task = {
      id: 't_abc123',
      name: 'Test task',
      status: 'TODO',
      todos: [],
      createdAt: '2024-01-07T10:00:00Z',
      updatedAt: '2024-01-07T10:00:00Z',
    };

    const result = TaskSchema.safeParse(task);
    expect(result.success).toBe(false);
  });
});
