package com.myapp.reservations.Controller;

import com.myapp.reservations.DTO.UserRequest;
import com.myapp.reservations.DTO.UserResponse;
import com.myapp.reservations.Services.UserService;
import com.myapp.reservations.entities.Role;
import com.myapp.reservations.entities.User;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("api/users")
public class UserController {

    private final UserService userService;
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping()
    public List<UserResponse> findAll(){
        return   userService.getUsers();
    }

    @GetMapping("/{id}")
    public UserResponse findById(@PathVariable (value = "id") UUID id){
        return userService.findById(id);
    }

    @PostMapping("/create")
    public UserResponse save(@Valid @RequestBody UserRequest user){
        return userService.createUser(user);
    }

    @GetMapping("/by-name/{name}")
    public UserResponse findByName(@PathVariable (value = "name") String name){
        return userService.findByName(name);
    }

    @GetMapping("/by-role/{role}")
    public List<UserResponse> findByRole(@PathVariable (value = "role") Role role){
        return userService.getUsersByRole(role);
    }

    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable (value = "id") UUID id){
        if(userService.findById(id) == null) return;
        userService.deleteUserById(id);
    }

    @PutMapping("/update/{id}")
    public void update(@PathVariable (value = "id") UUID id,@Valid @RequestBody User user){
        if(user == null || id == null) return ;
        userService.updateUser(id, user);
    }
}
