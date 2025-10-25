package com.eecs4413.auction_platform.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import lombok.*;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "payments")

public class Payment {
     @Id
     @GeneratedValue(strategy = GenerationType.IDENTITY)
     private Long paymentID;

     @ToString.Exclude
     @EqualsAndHashCode.Exclude
     @ManyToOne
     @JoinColumn(name = "auction_id", nullable = false)
     private Auction auction;

     @ToString.Exclude
     @EqualsAndHashCode.Exclude
     @ManyToOne
     @JoinColumn(name = "payee_id", nullable = false)
     private User payee;

     @Column(nullable = false)
     private OffsetDateTime paymentDate = OffsetDateTime.now();

     @Column(nullable = false)
     private OffsetDateTime expectedDeliveryDate = OffsetDateTime.now().plusDays(7);
}
