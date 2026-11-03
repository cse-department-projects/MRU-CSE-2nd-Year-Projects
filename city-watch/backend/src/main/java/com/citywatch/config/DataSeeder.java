package com.citywatch.config;

import com.citywatch.entity.AppUser;
import com.citywatch.entity.AuthorityProfile;
import com.citywatch.entity.Department;
import com.citywatch.entity.Role;
import com.citywatch.repository.AppUserRepository;
import com.citywatch.repository.AuthorityProfileRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seed(
            AppUserRepository users,
            AuthorityProfileRepository authorities,
            PasswordEncoder encoder) {

        return args -> {
            seedAuthority(
                    users, authorities, encoder,
                    "FD001",
                    "Fire Authority",
                    "fire@citywatch.local",
                    Department.FIRE,
                    "Fire@123"
            );

            seedAuthority(
                    users, authorities, encoder,
                    "MD001",
                    "Medical Authority",
                    "medical@citywatch.local",
                    Department.MEDICAL,
                    "Medical@123"
            );

            seedAuthority(
                    users, authorities, encoder,
                    "CD001",
                    "Crime Authority",
                    "crime@citywatch.local",
                    Department.CRIME,
                    "Crime@123"
            );

            seedAuthority(
                    users, authorities, encoder,
                    "AD001",
                    "Accident Authority",
                    "accident@citywatch.local",
                    Department.ACCIDENT,
                    "Accident@123"
            );
        };
    }

    private void seedAuthority(
            AppUserRepository users,
            AuthorityProfileRepository authorities,
            PasswordEncoder encoder,
            String code,
            String name,
            String email,
            Department department,
            String password) {

        if (users.findByEmailIgnoreCase(email).isPresent()) {
            return;
        }

        AppUser user = new AppUser();

        user.setUserCode(code);
        user.setName(name);
        user.setEmail(email);
        user.setPhone("0000000000");
        user.setPassword(encoder.encode(password));
        user.setRole(Role.AUTHORITY);

        users.save(user);

        AuthorityProfile profile = new AuthorityProfile();
        profile.setUser(user);
        profile.setDepartment(department);

        authorities.save(profile);
    }
}