package com.myapp.reservations.Controller;

import com.myapp.reservations.DTO.SignInRequest;
import com.myapp.reservations.DTO.UserDTOs.UserRequest;
import com.myapp.reservations.DTO.UserDTOs.UserResponse;
import com.myapp.reservations.Repository.UserRepository;
import com.myapp.reservations.Services.UserService;
import com.myapp.reservations.security.JwtUtil;
import com.myapp.reservations.entities.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:8080")
public class AuthenticationController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtils;
    private final UserService userService;

    @Autowired
    public AuthenticationController(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            JwtUtil jwtUtils,
            UserService userService
    ) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
        this.userService = userService;
    }


    @PostMapping("/signin")
    public String authenticateUser(@RequestBody SignInRequest user) {
        String login = user.identifier();


        if (login.contains("@")) {
            User existingUser = userRepository.findByEmail(login)
                    .orElseThrow(() -> new RuntimeException("Email not found"));

            login = existingUser.getName();
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        login,
                        user.password()
                )
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return jwtUtils.generateToken(userDetails.getUsername());
    }

    @PostMapping("/signup")
    public UserResponse registerUser(@RequestBody UserRequest user) {
        if (userRepository.existsByName(user.name())||userRepository.existsByEmail(user.email())) {
            throw new IllegalArgumentException("User with this email already exists");

        }
         return userService.createUser(user);
    }
}