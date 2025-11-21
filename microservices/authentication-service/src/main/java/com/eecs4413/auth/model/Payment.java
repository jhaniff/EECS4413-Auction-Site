package com.eecs4413.auth.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Data
@Builder(toBuilder = true)
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
     private OffsetDateTime paymentDate;

     @Column(nullable = false)
     private OffsetDateTime expectedDeliveryDate;

     @Column(name = "is_expedited", nullable = false)

     private boolean isExpedited;
}
