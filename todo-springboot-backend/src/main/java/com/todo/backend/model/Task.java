package com.todo.backend.model;

import java.time.Instant;

public class Task {
  private long id;
  private String title;
  private boolean completed;
  private Instant createdAt;

  public Task() {}

  public Task(long id, String title, boolean completed, Instant createdAt) {
    this.id = id;
    this.title = title;
    this.completed = completed;
    this.createdAt = createdAt;
  }

  public long getId() {
    return id;
  }

  public void setId(long id) {
    this.id = id;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public boolean isCompleted() {
    return completed;
  }

  public void setCompleted(boolean completed) {
    this.completed = completed;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }
}

