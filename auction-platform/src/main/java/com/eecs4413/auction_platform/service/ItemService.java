package com.eecs4413.auction_platform.service;

import com.eecs4413.auction_platform.dto.ItemDTO;
import com.eecs4413.auction_platform.model.Item;
import com.eecs4413.auction_platform.repository.ItemRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ItemService {
    private final ItemRepository itemRepository;

    public ItemService(ItemRepository itemRepository){
        this.itemRepository = itemRepository;
    }

    public List<ItemDTO> getItems() {
        List<Item> items = itemRepository.findAll();
        List<ItemDTO> itemDTOs = new ArrayList<>();
        for(Item item : items) {
            itemDTOs.add(convertEntityToDTO(item));
        }
        return itemDTOs;
    }

    public List<Item> searchItems(String query) {
        return itemRepository.searchByKeyword(query);
    }

    private ItemDTO convertEntityToDTO(Item item){
       return ItemDTO.builder()
               .name(item.getName())
               .description(item.getDescription())
               .type(item.getType())
               .shippingDays(item.getShippingDays())
               .createdAt(item.getCreatedAt())
               .isSold(item.isSold())
               .build();
    }


}
