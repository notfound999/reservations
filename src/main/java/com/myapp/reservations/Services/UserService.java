package com.myapp.reservations.Services;

import com.myapp.reservations.DTO.UserRequest;
import com.myapp.reservations.DTO.UserResponse;
import com.myapp.reservations.Mappers.UserMapper;
import com.myapp.reservations.Repository.UserRepository;
import com.myapp.reservations.entities.Role;
import com.myapp.reservations.entities.User;
import jakarta.transaction.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserResponse> getUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserMapper::toResponse)
                .collect(Collectors.toList());
    }

    public UserResponse findByName(String name){
        if(name==null){
            return null;
        }
        User user = userRepository.findByName(name);

        return UserMapper.toResponse(user);
    }

    public UserResponse findById(UUID id) {

        if(id==null){
            return null;
        }
        Optional<User> user = userRepository.findById(id);
        return user.map(UserMapper::toResponse).orElse(null);

    }

    public UserResponse findByEmail(String email){
        if(email==null){
            return null;
        }
        Optional<User> user = userRepository.findByEmail(email);
        return user.map(UserMapper::toResponse).orElse(null);
    }

    public boolean existsByEmail(String email){
        if(email==null){
            return false;
        }
        Optional<User> user = userRepository.findByEmail(email);
        return user.isPresent();
    }

    @Transactional
    public UserResponse createUser(UserRequest request) {
        if (request == null) return null;
        User user = UserMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.USER);
        User savedUser = userRepository.save(user);
        return UserMapper.toResponse(savedUser);
    }

    public List<UserResponse> getUsersByRole(Role role) {
        if(role==null){
            return null;
        }
        return userRepository.findByRole(role)
                .stream()
                .map(UserMapper::toResponse)
                .toList();
        }

    public void deleteUserById(UUID id) {
        if(id == null) {
            return;
        }
        userRepository.deleteById(id);
    }

    public void updateUser(UUID id, User user) {
        if(user == null || id == null) return;

        User userToUpdate = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        userToUpdate.setName(user.getName());
        userToUpdate.setEmail(user.getEmail());
        userToUpdate.setPassword(user.getPassword());

        userRepository.save(userToUpdate);
    }

    public UUID getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return UUID.fromString(auth.getName()); // name = subject from JWT
    }



}
