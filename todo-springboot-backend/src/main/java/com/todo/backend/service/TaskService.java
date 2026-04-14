package com.todo.backend.service;

import com.todo.backend.dto.CreateTaskRequest;
import com.todo.backend.dto.UpdateTaskRequest;
import com.todo.backend.model.Task;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class TaskService {
  private static final Logger log = LoggerFactory.getLogger(TaskService.class);

  private final List<Task> tasks = new ArrayList<>();
  private final AtomicLong idCounter = new AtomicLong(1);

  public List<Task> getAll() {
    synchronized (tasks) {
      int size = tasks.size();
      log.debug("Listed tasks: count={}", size);
      return new ArrayList<>(tasks);
    }
  }

  public Task create(CreateTaskRequest request) {
    Task created =
        new Task(idCounter.getAndIncrement(), request.getTitle().trim(), false, Instant.now());
    synchronized (tasks) {
      tasks.add(created);
    }
    log.info("Created task: id={}, title={}", created.getId(), created.getTitle());
    return created;
  }

  public Optional<Task> getById(long id) {
    synchronized (tasks) {
      return tasks.stream().filter(t -> t.getId() == id).findFirst();
    }
  }

  public Optional<Task> update(long id, UpdateTaskRequest request) {
    synchronized (tasks) {
      for (int i = 0; i < tasks.size(); i++) {
        Task existing = tasks.get(i);
        if (existing.getId() == id) {
          existing.setTitle(request.getTitle().trim());
          existing.setCompleted(Boolean.TRUE.equals(request.getCompleted()));
          log.info(
              "Updated task: id={}, title={}, completed={}",
              existing.getId(),
              existing.getTitle(),
              existing.isCompleted());
          return Optional.of(existing);
        }
      }
      log.warn("Update requested for missing task: id={}", id);
      return Optional.empty();
    }
  }

  public boolean delete(long id) {
    synchronized (tasks) {
      boolean removed = tasks.removeIf(t -> t.getId() == id);
      if (removed) {
        log.info("Deleted task: id={}", id);
      } else {
        log.warn("Delete requested for missing task: id={}", id);
      }
      return removed;
    }
  }
}

