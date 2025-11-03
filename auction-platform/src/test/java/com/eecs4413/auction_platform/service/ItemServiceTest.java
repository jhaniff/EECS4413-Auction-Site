package com.eecs4413.auction_platform.service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.argThat;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.eecs4413.auction_platform.dto.ItemCreateRequestDTO;
import com.eecs4413.auction_platform.dto.ItemDTO;
import com.eecs4413.auction_platform.model.Item;
import com.eecs4413.auction_platform.model.Keyword;
import com.eecs4413.auction_platform.model.User;
import com.eecs4413.auction_platform.repository.ItemRepository;
import com.eecs4413.auction_platform.repository.KeywordRepository;

@ExtendWith(MockitoExtension.class)
class ItemServiceTest {

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private KeywordRepository keywordRepository;

    @InjectMocks
    private ItemService itemService;

    private User seller;

    @BeforeEach
    void setUp() {
        // Reuse a seller fixture so individual tests can focus on behaviour.
        seller = User.builder()
                .userId(42L)
                .email("seller@example.com")
                .build();
    }

    @Test
    @SuppressWarnings("null")
    void createItemPersistsAndReturnsDtoWithKeywords() {
        ItemCreateRequestDTO request = ItemCreateRequestDTO.builder()
                .name("Camera")
                .description("4k video camera")
                .shippingDays(3)
                .baseShipCost(new BigDecimal("10.00"))
                .expeditedCost(new BigDecimal("25.00"))
                .keywords(List.of("Tech", " Gadgets ", "Tech"))
                .build();

        Keyword existing = Keyword.builder().keywordId(1L).term("Tech").build();
        Keyword createdKeyword = Keyword.builder().keywordId(2L).term("Gadgets").build();

        when(keywordRepository.findByTermIgnoreCase("Tech")).thenReturn(Optional.of(existing));
        when(keywordRepository.findByTermIgnoreCase("Gadgets")).thenReturn(Optional.empty());
        // Expect a single insert for the trimmed "Gadgets" keyword and reuse the existing "Tech" record.
        when(keywordRepository.save(org.mockito.ArgumentMatchers.any())).thenReturn(createdKeyword);

        OffsetDateTime createdAt = OffsetDateTime.now();
        Item saved = Item.builder()
                .itemId(100L)
                .seller(seller)
                .name("Camera")
                .description("4k video camera")
                .type("Forward")
                .shippingDays(3)
                .baseShipCost(new BigDecimal("10.00"))
                .expeditedCost(new BigDecimal("25.00"))
                .createdAt(createdAt)
                .keywords(List.of(existing, createdKeyword))
                .build();

        // Simulate repository assigning identifiers and timestamps during persistence.
        when(itemRepository.save(org.mockito.ArgumentMatchers.any())).thenReturn(saved);

        ItemDTO response = itemService.createItem(seller, request);

        assertThat(response.getItemId()).isEqualTo(100L);
        assertThat(response.getSellerId()).isEqualTo(42L);
        assertThat(response.getKeywords()).containsExactlyInAnyOrder("Tech", "Gadgets");
        assertThat(response.getBaseShipCost()).isEqualByComparingTo("10.00");
        assertThat(response.getExpeditedCost()).isEqualByComparingTo("25.00");

        ArgumentCaptor<Item> itemCaptor = ArgumentCaptor.forClass(Item.class);
        verify(itemRepository).save(itemCaptor.capture());
        Item captured = itemCaptor.getValue();
        assertThat(captured.getSeller()).isEqualTo(seller);
        assertThat(captured.getType()).isEqualTo("Forward");
        assertThat(captured.getKeywords()).hasSize(2);

        verify(keywordRepository).save(argThat(keyword -> keyword.getTerm().equals("Gadgets")));
    }
}
