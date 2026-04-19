package com.foliosage.security;

import com.foliosage.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service @RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .map(u -> User.withUsername(u.getEmail())
                        .password(u.getPasswordHash()).authorities("ROLE_USER").build())
                .orElseThrow(() -> new UsernameNotFoundException("Not found: " + email));
    }
}
