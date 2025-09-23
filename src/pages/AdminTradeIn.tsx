import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  TrendingUp,
  Smartphone,
  Users,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { 
  useTradeInModels, 
  useTradeInRequests, 
  useMarketConditions,
  useUpsertTradeInModel,
  useDeleteTradeInModel,
  useUpdateTradeInRequest,
  useUpsertMarketCondition
} from "@/hooks/useTradeIn";
import { TradeInModel, TradeInRequestWithModel, MarketCondition } from "@/integrations/supabase/types";

const AdminTradeIn = () => {
  const [activeTab, setActiveTab] = useState("models");
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);
  const [isConditionDialogOpen, setIsConditionDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<TradeInModel | null>(null);
  const [editingCondition, setEditingCondition] = useState<MarketCondition | null>(null);

  // Data hooks
  const { data: models, isLoading: modelsLoading } = useTradeInModels();
  const { data: requests, isLoading: requestsLoading } = useTradeInRequests();
  const { data: conditions, isLoading: conditionsLoading } = useMarketConditions();

  // Mutation hooks
  const upsertModel = useUpsertTradeInModel();
  const deleteModel = useDeleteTradeInModel();
  const updateRequest = useUpdateTradeInRequest();
  const upsertCondition = useUpsertMarketCondition();

  // Form state for model
  const [modelForm, setModelForm] = useState({
    brand: "",
    model: "",
    storage_options: [] as string[],
    release_date: "",
    original_price: "",
    base_trade_in_value: "",
    market_demand: "0.5",
    supply_level: "0.5",
    seasonal_factor: "1.0",
    competitor_price: "",
    is_active: true
  });

  // Form state for market condition
  const [conditionForm, setConditionForm] = useState({
    condition_type: "seasonal" as const,
    condition_value: "1.0",
    affected_models: [] as string[],
    start_date: "",
    end_date: "",
    description: "",
    is_active: true
  });

  const handleModelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const modelData = {
        ...(editingModel?.id && { id: editingModel.id }),
        ...modelForm,
        storage_options: modelForm.storage_options,
        original_price: parseFloat(modelForm.original_price),
        base_trade_in_value: parseFloat(modelForm.base_trade_in_value),
        market_demand: parseFloat(modelForm.market_demand),
        supply_level: parseFloat(modelForm.supply_level),
        seasonal_factor: parseFloat(modelForm.seasonal_factor),
        competitor_price: parseFloat(modelForm.competitor_price)
      };

      await upsertModel.mutateAsync(modelData);
      
      toast.success(editingModel ? "Model updated successfully!" : "Model created successfully!");
      setIsModelDialogOpen(false);
      setEditingModel(null);
      resetModelForm();
      
    } catch (error) {
      toast.error("Failed to save model. Please try again.");
      console.error(error);
    }
  };

  const handleConditionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const conditionData = {
        ...(editingCondition?.id && { id: editingCondition.id }),
        ...conditionForm,
        condition_value: parseFloat(conditionForm.condition_value),
        affected_models: conditionForm.affected_models
      };

      await upsertCondition.mutateAsync(conditionData);
      
      toast.success(editingCondition ? "Condition updated successfully!" : "Condition created successfully!");
      setIsConditionDialogOpen(false);
      setEditingCondition(null);
      resetConditionForm();
      
    } catch (error) {
      toast.error("Failed to save condition. Please try again.");
      console.error(error);
    }
  };

  const handleDeleteModel = async (id: string) => {
    if (confirm("Are you sure you want to delete this model? This action cannot be undone.")) {
      try {
        await deleteModel.mutateAsync(id);
        toast.success("Model deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete model. Please try again.");
      }
    }
  };

  const handleUpdateRequestStatus = async (id: string, status: string) => {
    try {
      await updateRequest.mutateAsync({
        id,
        updates: { 
          status: status as any,
          processed_at: new Date().toISOString()
        }
      });
      toast.success("Request status updated successfully!");
    } catch (error) {
      toast.error("Failed to update request status. Please try again.");
    }
  };

  const editModel = (model: TradeInModel) => {
    setEditingModel(model);
    setModelForm({
      brand: model.brand,
      model: model.model,
      storage_options: model.storage_options,
      release_date: model.release_date,
      original_price: model.original_price.toString(),
      base_trade_in_value: model.base_trade_in_value.toString(),
      market_demand: model.market_demand.toString(),
      supply_level: model.supply_level.toString(),
      seasonal_factor: model.seasonal_factor.toString(),
      competitor_price: model.competitor_price.toString(),
      is_active: model.is_active
    });
    setIsModelDialogOpen(true);
  };

  const editCondition = (condition: MarketCondition) => {
    setEditingCondition(condition);
    setConditionForm({
      condition_type: condition.condition_type,
      condition_value: condition.condition_value.toString(),
      affected_models: condition.affected_models,
      start_date: condition.start_date,
      end_date: condition.end_date || "",
      description: condition.description || "",
      is_active: condition.is_active
    });
    setIsConditionDialogOpen(true);
  };

  const resetModelForm = () => {
    setModelForm({
      brand: "",
      model: "",
      storage_options: [],
      release_date: "",
      original_price: "",
      base_trade_in_value: "",
      market_demand: "0.5",
      supply_level: "0.5",
      seasonal_factor: "1.0",
      competitor_price: "",
      is_active: true
    });
  };

  const resetConditionForm = () => {
    setConditionForm({
      condition_type: "seasonal",
      condition_value: "1.0",
      affected_models: [],
      start_date: "",
      end_date: "",
      description: "",
      is_active: true
    });
  };

  const addStorageOption = () => {
    setModelForm(prev => ({
      ...prev,
      storage_options: [...prev.storage_options, ""]
    }));
  };

  const updateStorageOption = (index: number, value: string) => {
    setModelForm(prev => ({
      ...prev,
      storage_options: prev.storage_options.map((option, i) => 
        i === index ? value : option
      )
    }));
  };

  const removeStorageOption = (index: number) => {
    setModelForm(prev => ({
      ...prev,
      storage_options: prev.storage_options.filter((_, i) => i !== index)
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Trade-In Management</h1>
          <p className="text-gray-600">Manage trade-in models, requests, and market conditions</p>
        </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <Smartphone className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Models</p>
                <p className="text-xl sm:text-2xl font-bold">{models?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-success" />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Requests</p>
                <p className="text-xl sm:text-2xl font-bold">{requests?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-warning" />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Pending</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {requests?.filter(r => r.status === 'pending').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-info" />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Market Conditions</p>
                <p className="text-xl sm:text-2xl font-bold">{conditions?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto sm:h-10">
          <TabsTrigger value="models" className="py-2 sm:py-0">
            <span className="text-xs sm:text-sm">Trade-In Models</span>
          </TabsTrigger>
          <TabsTrigger value="requests" className="py-2 sm:py-0">
            <span className="text-xs sm:text-sm">Trade-In Requests</span>
          </TabsTrigger>
          <TabsTrigger value="conditions" className="py-2 sm:py-0">
            <span className="text-xs sm:text-sm">Market Conditions</span>
          </TabsTrigger>
        </TabsList>

        {/* Trade-In Models Tab */}
        <TabsContent value="models" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl sm:text-2xl font-semibold">Trade-In Models</h2>
            <Button onClick={() => setIsModelDialogOpen(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Model
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[100px]">Brand</TableHead>
                      <TableHead className="min-w-[120px]">Model</TableHead>
                      <TableHead className="min-w-[100px]">Storage</TableHead>
                      <TableHead className="min-w-[100px]">Base Value</TableHead>
                      <TableHead className="min-w-[120px]">Market Demand</TableHead>
                      <TableHead className="min-w-[80px]">Status</TableHead>
                      <TableHead className="min-w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {models?.map((model) => (
                      <TableRow key={model.id}>
                        <TableCell className="font-medium">{model.brand}</TableCell>
                        <TableCell>{model.model}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {model.storage_options.map((storage, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {storage}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>${model.base_trade_in_value}</TableCell>
                        <TableCell>{Math.round(model.market_demand * 100)}%</TableCell>
                        <TableCell>
                          <Badge variant={model.is_active ? "default" : "secondary"}>
                            {model.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => editModel(model)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteModel(model.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trade-In Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold">Trade-In Requests</h2>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">Customer</TableHead>
                      <TableHead className="min-w-[120px]">Device</TableHead>
                      <TableHead className="min-w-[100px]">Storage</TableHead>
                      <TableHead className="min-w-[100px]">Condition</TableHead>
                      <TableHead className="min-w-[120px]">Estimated Value</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="min-w-[150px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests?.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{request.first_name} {request.last_name}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-[150px]">{request.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{request.trade_in_model.brand}</p>
                            <p className="text-sm text-muted-foreground">{request.trade_in_model.model}</p>
                          </div>
                        </TableCell>
                        <TableCell>{request.storage_capacity}</TableCell>
                        <TableCell className="capitalize">{request.device_condition}</TableCell>
                        <TableCell>${request.estimated_value}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(request.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(request.status)}
                              <span className="hidden sm:inline">{request.status}</span>
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateRequestStatus(request.id, 'approved')}
                              disabled={request.status === 'approved'}
                              className="text-xs"
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateRequestStatus(request.id, 'rejected')}
                              disabled={request.status === 'rejected'}
                              className="text-xs"
                            >
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Conditions Tab */}
        <TabsContent value="conditions" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl sm:text-2xl font-semibold">Market Conditions</h2>
            <Button onClick={() => setIsConditionDialogOpen(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Condition
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[100px]">Type</TableHead>
                      <TableHead className="min-w-[80px]">Value</TableHead>
                      <TableHead className="min-w-[120px]">Start Date</TableHead>
                      <TableHead className="min-w-[120px]">End Date</TableHead>
                      <TableHead className="min-w-[150px]">Description</TableHead>
                      <TableHead className="min-w-[80px]">Status</TableHead>
                      <TableHead className="min-w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conditions?.map((condition) => (
                      <TableRow key={condition.id}>
                        <TableCell className="capitalize">{condition.condition_type}</TableCell>
                        <TableCell>{condition.condition_value}x</TableCell>
                        <TableCell>{new Date(condition.start_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {condition.end_date ? new Date(condition.end_date).toLocaleDateString() : 'Ongoing'}
                        </TableCell>
                        <TableCell>
                          <span className="truncate max-w-[150px] block" title={condition.description}>
                            {condition.description}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={condition.is_active ? "default" : "secondary"}>
                            {condition.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => editCondition(condition)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Model Dialog */}
      <Dialog open={isModelDialogOpen} onOpenChange={setIsModelDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>
              {editingModel ? "Edit Trade-In Model" : "Add New Trade-In Model"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleModelSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={modelForm.brand}
                  onChange={(e) => setModelForm(prev => ({ ...prev, brand: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={modelForm.model}
                  onChange={(e) => setModelForm(prev => ({ ...prev, model: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Storage Options</Label>
              <div className="space-y-2">
                {modelForm.storage_options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => updateStorageOption(index, e.target.value)}
                      placeholder="e.g., 128GB"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeStorageOption(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addStorageOption}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Storage Option
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="release_date">Release Date</Label>
                <Input
                  id="release_date"
                  type="date"
                  value={modelForm.release_date}
                  onChange={(e) => setModelForm(prev => ({ ...prev, release_date: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="original_price">Original Price</Label>
                <Input
                  id="original_price"
                  type="number"
                  step="0.01"
                  value={modelForm.original_price}
                  onChange={(e) => setModelForm(prev => ({ ...prev, original_price: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="base_trade_in_value">Base Trade-In Value</Label>
                <Input
                  id="base_trade_in_value"
                  type="number"
                  step="0.01"
                  value={modelForm.base_trade_in_value}
                  onChange={(e) => setModelForm(prev => ({ ...prev, base_trade_in_value: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="competitor_price">Competitor Price</Label>
                <Input
                  id="competitor_price"
                  type="number"
                  step="0.01"
                  value={modelForm.competitor_price}
                  onChange={(e) => setModelForm(prev => ({ ...prev, competitor_price: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="market_demand">Market Demand (0-1)</Label>
                <Input
                  id="market_demand"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={modelForm.market_demand}
                  onChange={(e) => setModelForm(prev => ({ ...prev, market_demand: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="supply_level">Supply Level (0-1)</Label>
                <Input
                  id="supply_level"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={modelForm.supply_level}
                  onChange={(e) => setModelForm(prev => ({ ...prev, supply_level: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="seasonal_factor">Seasonal Factor</Label>
                <Input
                  id="seasonal_factor"
                  type="number"
                  step="0.01"
                  value={modelForm.seasonal_factor}
                  onChange={(e) => setModelForm(prev => ({ ...prev, seasonal_factor: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button type="submit" className="flex-1" disabled={upsertModel.isPending}>
                {upsertModel.isPending ? "Saving..." : (editingModel ? "Update Model" : "Create Model")}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setIsModelDialogOpen(false);
                  setEditingModel(null);
                  resetModelForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Market Condition Dialog */}
      <Dialog open={isConditionDialogOpen} onOpenChange={setIsConditionDialogOpen}>
        <DialogContent className="max-w-lg mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCondition ? "Edit Market Condition" : "Add New Market Condition"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleConditionSubmit} className="space-y-6">
            <div>
              <Label htmlFor="condition_type">Condition Type</Label>
              <Select
                value={conditionForm.condition_type}
                onValueChange={(value: any) => setConditionForm(prev => ({ ...prev, condition_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seasonal">Seasonal</SelectItem>
                  <SelectItem value="demand">Demand</SelectItem>
                  <SelectItem value="supply">Supply</SelectItem>
                  <SelectItem value="competitor">Competitor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="condition_value">Condition Value</Label>
              <Input
                id="condition_value"
                type="number"
                step="0.01"
                value={conditionForm.condition_value}
                onChange={(e) => setConditionForm(prev => ({ ...prev, condition_value: e.target.value }))}
                placeholder="e.g., 1.15 for 15% boost"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={conditionForm.start_date}
                  onChange={(e) => setConditionForm(prev => ({ ...prev, start_date: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date (Optional)</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={conditionForm.end_date}
                  onChange={(e) => setConditionForm(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={conditionForm.description}
                onChange={(e) => setConditionForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the market condition..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button type="submit" className="flex-1" disabled={upsertCondition.isPending}>
                {upsertCondition.isPending ? "Saving..." : (editingCondition ? "Update Condition" : "Create Condition")}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setIsConditionDialogOpen(false);
                  setEditingCondition(null);
                  resetConditionForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default AdminTradeIn;
