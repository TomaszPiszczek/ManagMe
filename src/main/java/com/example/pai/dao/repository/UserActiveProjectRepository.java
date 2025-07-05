package com.example.pai.dao.repository;

import com.example.pai.dao.model.UserActiveProject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserActiveProjectRepository extends JpaRepository<UserActiveProject, UUID> {
    Optional<UserActiveProject> findByUserId(UUID userId);
}