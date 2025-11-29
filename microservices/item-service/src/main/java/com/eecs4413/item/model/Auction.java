package com.eecs4413.item.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "auctions")
public class Auction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long auctionId;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToOne
    @JoinColumn(name = "item_id", unique = true, nullable = false)
    private Item item;

    @Column(nullable = false)
    private int startPrice;

    @Column(nullable = false)
    private int currentPrice;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne
    @JoinColumn(name = "highest_bidder")
    private User highestBidder;

    @Column(nullable = false)
    private OffsetDateTime startsAt = OffsetDateTime.now();

    @Column(nullable = false)
    private OffsetDateTime endsAt;

    @Column(nullable = false)
    private String status = "ONGOING"; // ONGOING, ENDED, CANCELLED

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "auction", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Bid> bids;
}
