import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  TradeInModel, 
  TradeInRequest, 
  TradeInRequestWithModel, 
  MarketCondition,
  TradeInCalculationResult 
} from '@/integrations/supabase/types';

// Fetch all trade-in models
export const useTradeInModels = () => {
  return useQuery({
    queryKey: ['tradeInModels'],
    queryFn: async (): Promise<TradeInModel[]> => {
      const { data, error } = await supabase
        .from('trade_in_models')
        .select('*')
        .eq('is_active', true)
        .order('brand', { ascending: true })
        .order('release_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

// Fetch trade-in models by brand
export const useTradeInModelsByBrand = (brand: string) => {
  return useQuery({
    queryKey: ['tradeInModels', brand],
    queryFn: async (): Promise<TradeInModel[]> => {
      const { data, error } = await supabase
        .from('trade_in_models')
        .select('*')
        .eq('brand', brand)
        .eq('is_active', true)
        .order('release_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!brand,
  });
};

// Fetch specific trade-in model
export const useTradeInModel = (id: string) => {
  return useQuery({
    queryKey: ['tradeInModel', id],
    queryFn: async (): Promise<TradeInModel | null> => {
      const { data, error } = await supabase
        .from('trade_in_models')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

// Fetch trade-in requests (admin only)
export const useTradeInRequests = () => {
  return useQuery({
    queryKey: ['tradeInRequests'],
    queryFn: async (): Promise<TradeInRequestWithModel[]> => {
      const { data, error } = await supabase
        .from('trade_in_requests')
        .select(`
          *,
          trade_in_model:trade_in_models(*),
          user:user_id(email, user_metadata)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

// Fetch user's trade-in requests
export const useUserTradeInRequests = (userId: string) => {
  return useQuery({
    queryKey: ['userTradeInRequests', userId],
    queryFn: async (): Promise<TradeInRequestWithModel[]> => {
      const { data, error } = await supabase
        .from('trade_in_requests')
        .select(`
          *,
          trade_in_model:trade_in_models(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
};

// Fetch market conditions
export const useMarketConditions = () => {
  return useQuery({
    queryKey: ['marketConditions'],
    queryFn: async (): Promise<MarketCondition[]> => {
      const { data, error } = await supabase
        .from('market_conditions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

// Create trade-in request
export const useCreateTradeInRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: Omit<TradeInRequest, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('trade_in_requests')
        .insert([request])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tradeInRequests'] });
      queryClient.invalidateQueries({ queryKey: ['userTradeInRequests'] });
    },
  });
};

// Update trade-in request status
export const useUpdateTradeInRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<TradeInRequest> 
    }) => {
      const { data, error } = await supabase
        .from('trade_in_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tradeInRequests'] });
      queryClient.invalidateQueries({ queryKey: ['userTradeInRequests'] });
    },
  });
};

// Create or update trade-in model (admin only)
export const useUpsertTradeInModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (model: Partial<TradeInModel> & { id?: string }) => {
      if (model.id) {
        // Update existing model
        const { data, error } = await supabase
          .from('trade_in_models')
          .update(model)
          .eq('id', model.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new model
        const { data, error } = await supabase
          .from('trade_in_models')
          .insert([model])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tradeInModels'] });
    },
  });
};

// Delete trade-in model (admin only)
export const useDeleteTradeInModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('trade_in_models')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tradeInModels'] });
    },
  });
};

// Create or update market condition (admin only)
export const useUpsertMarketCondition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (condition: Partial<MarketCondition> & { id?: string }) => {
      if (condition.id) {
        // Update existing condition
        const { data, error } = await supabase
          .from('market_conditions')
          .update(condition)
          .eq('id', condition.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new condition
        const { data, error } = await supabase
          .from('market_conditions')
          .insert([condition])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketConditions'] });
    },
  });
};

// Calculate trade-in value using real algorithm
export const calculateTradeInValue = async (
  modelId: string,
  storageCapacity: string,
  deviceCondition: string
): Promise<TradeInCalculationResult> => {
  // Get the trade-in model
  const { data: model, error: modelError } = await supabase
    .from('trade_in_models')
    .select('*')
    .eq('id', modelId)
    .single();

  if (modelError || !model) {
    throw new Error('Trade-in model not found');
  }

  // Get current market conditions (optional - table might not exist yet)
  let conditions: any[] = [];
  try {
    const { data: conditionsData, error: conditionsError } = await supabase
      .from('market_conditions')
      .select('*')
      .eq('is_active', true);
    
    if (!conditionsError && conditionsData) {
      conditions = conditionsData;
    }
  } catch (error) {
    // Market conditions table might not exist yet, continue without it
    console.log('Market conditions table not available, using default values');
  }

  // Real pricing algorithm
  const now = new Date();
  const releaseDate = new Date(model.release_date);
  const monthsSinceRelease = (now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
  
  // Time decay calculation - More realistic depreciation
  const timeDecay = Math.max(0.4, 1 - (monthsSinceRelease * 0.03));
  
  // Seasonal adjustments
  const currentMonth = now.getMonth();
  let seasonalAdjustment = 1.0;
  
  if (currentMonth >= 8 && currentMonth <= 11) {
    seasonalAdjustment = 1.15; // Holiday season
  } else if (currentMonth === 8 || currentMonth === 9) {
    seasonalAdjustment = 1.20; // iPhone launch
  } else if (currentMonth === 0 || currentMonth === 1) {
    seasonalAdjustment = 0.90; // Post-holiday
  } else if (currentMonth >= 5 && currentMonth <= 7) {
    seasonalAdjustment = 0.95; // Summer
  }
  
  // Market demand calculation
  let marketDemand = model.market_demand;
  if (monthsSinceRelease <= 6) {
    marketDemand *= 1.3;
  } else if (monthsSinceRelease <= 12) {
    marketDemand *= 1.1;
  } else if (monthsSinceRelease <= 24) {
    marketDemand *= 0.9;
  } else {
    marketDemand *= 0.7;
  }
  
  // Supply level calculation
  let supplyLevel = model.supply_level;
  if (monthsSinceRelease <= 6) {
    supplyLevel *= 0.3;
  } else if (monthsSinceRelease <= 12) {
    supplyLevel *= 0.6;
  } else if (monthsSinceRelease <= 24) {
    supplyLevel *= 0.8;
  } else {
    supplyLevel *= 1.0;
  }
  
  // Storage multipliers
  const storageMultipliers: Record<string, number> = {
    "64GB": 1.0,
    "128GB": 1.0,
    "256GB": 1.15,
    "512GB": 1.35,
    "1TB": 1.6
  };
  
  // Condition multipliers
  const conditionMultipliers: Record<string, number> = {
    "excellent": 1.0,
    "good": 0.8,
    "fair": 0.6,
    "poor": 0.3
  };
  
  const storageMultiplier = storageMultipliers[storageCapacity] || 1.0;
  const conditionMultiplier = conditionMultipliers[deviceCondition] || 0.5;
  
  // Calculate final value
  let baseValue = model.base_trade_in_value * timeDecay;
  
  // Supply and demand economics - Less aggressive multipliers
  const supplyDemandRatio = marketDemand / supplyLevel;
  let supplyDemandMultiplier = 1.0;
  
  if (supplyDemandRatio > 2) {
    supplyDemandMultiplier = 1.2; // Reduced from 1.4
  } else if (supplyDemandRatio > 1.5) {
    supplyDemandMultiplier = 1.15; // Reduced from 1.25
  } else if (supplyDemandRatio > 1) {
    supplyDemandMultiplier = 1.05; // Reduced from 1.1
  } else if (supplyDemandRatio > 0.5) {
    supplyDemandMultiplier = 0.95; // Increased from 0.9
  } else {
    supplyDemandMultiplier = 0.85; // Increased from 0.7
  }
  
  // Market position analysis - Less aggressive multipliers
  const marketPosition = model.competitor_price / baseValue;
  let marketPositionMultiplier = 1.0;
  
  if (marketPosition > 1.1) {
    marketPositionMultiplier = 1.08; // Reduced from 1.15
  } else if (marketPosition > 0.9) {
    marketPositionMultiplier = 1.02; // Reduced from 1.05
  } else {
    marketPositionMultiplier = 0.98; // Increased from 0.95
  }
  
  // Final calculation
  let finalValue = baseValue * 
                  supplyDemandMultiplier * 
                  marketPositionMultiplier * 
                  seasonalAdjustment * 
                  storageMultiplier * 
                  conditionMultiplier;
  
  // Apply market constraints - More realistic bounds
  const maxValue = Math.min(model.original_price * 0.7, finalValue * 1.3);
  const minValue = Math.max(model.base_trade_in_value * 0.3, model.original_price * 0.1);
  
  finalValue = Math.max(minValue, Math.min(maxValue, finalValue));
  finalValue = Math.round(finalValue / 5) * 5;
  
  // Record pricing history (optional - table might not exist yet)
  try {
    await supabase.from('trade_in_pricing_history').insert([{
      model_id: modelId,
      base_price: baseValue,
      market_demand: marketDemand,
      supply_level: supplyLevel,
      seasonal_factor: seasonalAdjustment,
      competitor_price: model.competitor_price,
      calculated_value: finalValue,
      market_conditions: {
        supplyDemandRatio,
        marketPosition,
        timeDecay,
        monthsSinceRelease
      }
    }]);
  } catch (error) {
    // Pricing history table might not exist yet, continue without recording
    console.log('Pricing history table not available, skipping recording');
  }
  
  return {
    basePrice: Math.round(baseValue),
    supplyDemandMultiplier: Math.round(supplyDemandMultiplier * 100) / 100,
    marketPositionMultiplier: Math.round(marketPositionMultiplier * 100) / 100,
    seasonalMultiplier: Math.round(seasonalAdjustment * 100) / 100,
    storageValue: Math.round(storageMultiplier * 100) / 100,
    conditionMultiplier: Math.round(conditionMultiplier * 100) / 100,
    supplyDemandRatio: Math.round(supplyDemandRatio * 100) / 100,
    marketPosition: Math.round(marketPosition * 100) / 100,
    finalValue: finalValue,
    competitorPrice: Math.round(model.competitor_price),
    marketDemand: Math.round(marketDemand * 100),
    supplyLevel: Math.round(supplyLevel * 100),
    monthsSinceRelease: Math.round(monthsSinceRelease)
  };
};
