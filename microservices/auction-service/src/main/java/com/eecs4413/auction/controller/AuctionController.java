package com.eecs4413.auction.controller;

import com.eecs4413.auction.dto.*;
import com.eecs4413.auction.hateos.AuctionAssembler;
import com.eecs4413.auction.model.UserPrincipal;
import com.eecs4413.auction.service.AuctionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping("/api/auction")
public class AuctionController {
    private final AuctionService auctionService;
    private final AuctionAssembler auctionAssembler;

    public AuctionController(AuctionService auctionService, AuctionAssembler auctionAssembler){
        this.auctionService = auctionService;
        this.auctionAssembler = auctionAssembler;
    }

    @GetMapping("/search")
    public ResponseEntity<PagedModel<EntityModel<AuctionDTO>>> search(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "endsAt") String sortBy,
            @RequestParam(defaultValue = "asc") String direction,
            PagedResourcesAssembler<AuctionDTO> pagedAssembler) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<AuctionDTO> results = auctionService.searchAuctionsByItemKeyword(query, pageable);

        PagedModel<EntityModel<AuctionDTO>> model =
                pagedAssembler.toModel(results, auctionAssembler);

        return ResponseEntity.ok(model);
    }

    @GetMapping("/{auctionId}")
    public ResponseEntity<EntityModel<AuctionDetailDTO>> getAuction(@PathVariable Long auctionId){
        AuctionDetailDTO auction = auctionService.getAuctionDetails(auctionId);

        EntityModel<AuctionDetailDTO> model = auctionAssembler.toDetailModel(auction);

        return ResponseEntity.ok(model);
    }
    @PostMapping("/bid")
    public ResponseEntity<EntityModel<BidResponseDTO>> submitBid(@Valid @RequestBody BidRequestDTO bid, @AuthenticationPrincipal UserPrincipal user){
        BidResponseDTO response = auctionService.placeBid(bid, user.getUser().getUserId());

        EntityModel<BidResponseDTO> model = EntityModel.of(response,
                // link back to the auction user just bid on
                linkTo(methodOn(AuctionController.class)
                        .getAuction(response.getAuctionId()))
                        .withRel("auction"),

                // link to bids
                linkTo(methodOn(AuctionController.class)
                        .getMyBids(null))
                        .withRel("my-bids")
        );
        return ResponseEntity.ok(model);
    }

    @GetMapping("/my-bids")
    public ResponseEntity<CollectionModel<EntityModel<UserBidSummaryDTO>>> getMyBids(@AuthenticationPrincipal UserPrincipal user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long userId = user.getUser().getUserId();
        List<UserBidSummaryDTO> bids = auctionService.getUserBidSummaries(userId);

        List<EntityModel<UserBidSummaryDTO>> bidModels = bids.stream()
                .map(auctionAssembler::toBidSummaryModel)
                .toList();

        CollectionModel<EntityModel<UserBidSummaryDTO>> collection =
                CollectionModel.of(bidModels,
                        linkTo(methodOn(AuctionController.class)
                                .getMyBids(null))
                                .withSelfRel());

        return ResponseEntity.ok(collection);
    }
}
