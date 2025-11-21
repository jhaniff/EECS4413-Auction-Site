package com.eecs4413.auction.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "user_addresses")
public class UserAddress {

    @Id
    private Long userId;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String streetName;

    @Column(nullable = false)
    private String streetNumber;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String country;

    @Column(nullable = false)
    private String postalCode;
}
