package com.homemanager.budget.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Monthly budget summary: total spent and a per-category breakdown.
 */
public record ExpenseSummary(String month, BigDecimal total, List<CategoryTotal> byCategory) {

    public record CategoryTotal(String category, BigDecimal total) {}
}
