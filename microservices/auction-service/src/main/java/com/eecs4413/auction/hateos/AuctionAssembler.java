package com.eecs4413.auction.hateos;

import com.eecs4413.auction.controller.AuctionController;
import com.eecs4413.auction.dto.AuctionDTO;
import com.eecs4413.auction.dto.AuctionDetailDTO;
import com.eecs4413.auction.dto.UserBidSummaryDTO;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.server.RepresentationModelAssembler;
import org.springframework.stereotype.Component;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@Component
public class AuctionAssembler implements RepresentationModelAssembler<AuctionDTO, EntityModel<AuctionDTO>> {

    @Override
    public EntityModel<AuctionDTO> toModel(AuctionDTO auction) {
        return EntityModel.of(auction,
                // self
                linkTo(methodOn(AuctionController.class)
                        .getAuction(auction.getAuctionId()))
                        .withSelfRel(),

                //link to place bid
                linkTo(methodOn(AuctionController.class)
                        .submitBid(null, null))
                        .withRel("place-bid"),

                // link to search
                linkTo(methodOn(AuctionController.class)
                        .search(null, 0, 10, "endsAt", "asc", null))
                        .withRel("search")
        );
    }


    public EntityModel<AuctionDetailDTO> toDetailModel(AuctionDetailDTO auction) {
        return EntityModel.of(auction,
                linkTo(methodOn(AuctionController.class)
                        .getAuction(auction.getAuctionId()))
                        .withSelfRel(),
                linkTo(methodOn(AuctionController.class)
                        .submitBid(null, null))
                        .withRel("place-bid"),
                linkTo(methodOn(AuctionController.class)
                        .search(null, 0, 10, "endsAt", "asc", null))
                        .withRel("search")
        );
    }

    public EntityModel<UserBidSummaryDTO> toBidSummaryModel(UserBidSummaryDTO bid){
        return EntityModel.of(bid,
                // Link to the auction
                linkTo(methodOn(AuctionController.class)
                        .getAuction(bid.getAuctionId()))
                        .withRel("auction"),
                //Link to place bid
                linkTo(methodOn(AuctionController.class)
                        .submitBid(null, null))
                        .withRel("place-bid")
        );
    }
}
