package com.myapp.reservations.Controller;

import com.myapp.reservations.DTO.UserDto;
import com.myapp.reservations.Services.UserService;
import com.myapp.reservations.entities.Role;
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
    public List<UserDto> findAll(){
        return   userService.getUsers();
    }

    @GetMapping("/{id}")
    public UserDto findById(@PathVariable (value = "id") UUID id){
        return userService.findById(id);
    }

    @PostMapping()
    public UserDto save(@RequestBody UserDto userDto){
        return userService.save(userDto);
    }

    @GetMapping("/by-name/{name}")
    public UserDto findByName(@PathVariable (value = "name") String name){
        return userService.findByName(name);
    }

    @GetMapping("/by-role/{role}")
    public List<UserDto> findByRole(@PathVariable (value = "role") Role role){
        return userService.getUsersByRole(role);
    }
}
