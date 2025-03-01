package com.example.pai.dao.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_managment")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserManagment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(length = 50, unique = true, nullable = false)
    private String email;

    @Column(length = 255, nullable = false)
    private String password;

    @Column(name = "role_id")
    private UUID roleId;

    @Column(name = "creation_timestamp")
    private LocalDateTime creationTimestamp;

    @Column(name = "modification_timestamp")
    private LocalDateTime modificationTimestamp;

    @Column
    private Boolean activated;

    @Column
    private Boolean hidden = false;

    @Column(name = "activation_key", length = 55)
    private String activationKey;

    @Column(name = "organization_id")
    private UUID organizationId;

    @Column(length = 255)
    private String name;

    @PrePersist
    protected void onCreate() {
        creationTimestamp = LocalDateTime.now();
        modificationTimestamp = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        modificationTimestamp = LocalDateTime.now();
    }
}