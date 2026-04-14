package com.todo.backend.controller;

import com.todo.backend.dto.CreateTaskRequest;
import com.todo.backend.dto.UpdateTaskRequest;
import com.todo.backend.model.Task;
import com.todo.backend.service.TaskService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(
    originPatterns = {"http://localhost:*", "http://127.0.0.1:*"},
    allowCredentials = "true")
public class TaskController {
  private final TaskService taskService;

  public TaskController(TaskService taskService) {
    this.taskService = taskService;
  }

  @GetMapping
  public List<Task> list() {
    return taskService.getAll();
  }

  @PostMapping
  public ResponseEntity<Task> create(@Valid @RequestBody CreateTaskRequest request) {
    Task created = taskService.create(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  @PutMapping("/{id}")
  public ResponseEntity<Task> update(
      @PathVariable("id") long id, @Valid @RequestBody UpdateTaskRequest request) {
    return taskService
        .update(id, request)
        .map(ResponseEntity::ok)
        .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable("id") long id) {
    boolean removed = taskService.delete(id);
    return removed
        ? ResponseEntity.noContent().build()
        : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
  }
}

