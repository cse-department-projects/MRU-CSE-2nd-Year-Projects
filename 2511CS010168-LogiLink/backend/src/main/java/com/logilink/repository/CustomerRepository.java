package com.logilink.repository;

import com.logilink.entity.Customer;
import com.logilink.entity.Organization;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
  Optional<Customer> findByEmail(String email);
  Optional<Customer> findByEmailAndOrganization(String email, Organization organization);
  List<Customer> findAllByOrganization(Organization organization);
  Optional<Customer> findByIdAndOrganization(Long id, Organization organization);
}
