import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Loader2, 
  IndianRupee, 
  Calendar,
  Trash2,
  Save,
  AlertCircle
} from 'lucide-react';
import { feeService } from '@/services/fee.service';
import { academicService } from '@/services/academic.service';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { toast } from 'react-hot-toast';

export const FeeStructurePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newStructure, setNewStructure] = useState({
    name: '',
    academicYearId: '',
    gradeLevelId: '',
    frequency: 'annual',
    components: [{ label: '', amount: 0 }]
  });

  // Fetch Academic Years
  const { data: yearsData } = useQuery({
    queryKey: ['academic-years'],
    queryFn: () => academicService.getAcademicYears(),
  });

  // Fetch Grade Levels
  const { data: gradesData } = useQuery({
    queryKey: ['grade-levels'],
    queryFn: () => academicService.getGradeLevels(),
  });

  // Fetch Fee Structures
  const { data: structuresData, isLoading } = useQuery({
    queryKey: ['fee-structures'],
    queryFn: () => feeService.getStructures(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => feeService.createStructure(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-structures'] });
      toast.success('Fee structure created successfully');
      setIsAdding(false);
      setNewStructure({
        name: '',
        academicYearId: '',
        gradeLevelId: '',
        frequency: 'annual',
        components: [{ label: '', amount: 0 }]
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create fee structure');
    }
  });

  const handleAddComponent = () => {
    setNewStructure({
      ...newStructure,
      components: [...newStructure.components, { label: '', amount: 0 }]
    });
  };

  const handleRemoveComponent = (index: number) => {
    setNewStructure({
      ...newStructure,
      components: newStructure.components.filter((_, i) => i !== index)
    });
  };

  const handleComponentChange = (index: number, field: string, value: any) => {
    const updatedComponents = [...newStructure.components];
    updatedComponents[index] = { ...updatedComponents[index], [field]: value };
    setNewStructure({ ...newStructure, components: updatedComponents });
  };

  const handleSave = () => {
    if (!newStructure.name || !newStructure.academicYearId) {
      toast.error('Please fill in all required fields');
      return;
    }
    createMutation.mutate(newStructure);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Structures</h1>
          <p className="text-gray-500">Define and manage school fee components per grade.</p>
        </div>
        <Button 
          onClick={() => setIsAdding(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Structure
        </Button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm space-y-6 animate-in fade-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Structure Name</label>
              <Input 
                placeholder="e.g. Annual Fees 2024"
                value={newStructure.name}
                onChange={(e) => setNewStructure({ ...newStructure, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Academic Year</label>
              <select 
                className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={newStructure.academicYearId}
                onChange={(e) => setNewStructure({ ...newStructure, academicYearId: e.target.value })}
              >
                <option value="">Select Year</option>
                {yearsData?.data?.map(y => (
                  <option key={y.id} value={y.id}>{y.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Grade Level (Optional)</label>
              <select 
                className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={newStructure.gradeLevelId}
                onChange={(e) => setNewStructure({ ...newStructure, gradeLevelId: e.target.value })}
              >
                <option value="">All Grades</option>
                {gradesData?.data?.map(g => (
                  <option key={g.id} value={g.id}>{g.displayName}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Frequency</label>
              <select 
                className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={newStructure.frequency}
                onChange={(e) => setNewStructure({ ...newStructure, frequency: e.target.value as any })}
              >
                <option value="annual">Annual</option>
                <option value="term">Term</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Fee Components</h3>
              <Button 
                type="button"
                variant="outline" 
                size="sm"
                onClick={handleAddComponent}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Component
              </Button>
            </div>
            
            <div className="space-y-3">
              {newStructure.components.map((comp, index) => (
                <div key={index} className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2">
                  <Input 
                    placeholder="Component Label (e.g. Tuition Fee)"
                    value={comp.label}
                    onChange={(e) => handleComponentChange(index, 'label', e.target.value)}
                    className="flex-1"
                  />
                  <div className="relative w-40">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      type="number"
                      placeholder="Amount"
                      value={comp.amount}
                      onChange={(e) => handleComponentChange(index, 'amount', Number(e.target.value))}
                      className="pl-10"
                    />
                  </div>
                  <button 
                    onClick={() => handleRemoveComponent(index)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            <Button 
              onClick={handleSave}
              isLoading={createMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Structure
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {structuresData?.data?.map((structure) => (
            <div key={structure.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
              <div className="p-5 border-b border-gray-50 bg-gray-50/50">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-gray-900">{structure.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{structure.frequency.toUpperCase()}</span>
                      <span>•</span>
                      <span>{structure.gradeLevel?.displayName || 'All Grades'}</span>
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <IndianRupee className="h-5 w-5" />
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-2">
                  {structure.components.map((comp, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-600">{comp.label}</span>
                      <span className="font-medium text-gray-900">₹{comp.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                  <span className="text-xs text-gray-400">Total Amount</span>
                  <span className="text-lg font-bold text-indigo-600">
                    ₹{structure.components.reduce((sum, c) => sum + Number(c.amount), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {structuresData?.data?.length === 0 && !isAdding && (
            <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No fee structures found</h3>
              <p className="text-gray-500 max-w-xs mx-auto mt-1">
                Start by creating a fee structure for an academic year or specific grade.
              </p>
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => setIsAdding(true)}
              >
                Create First Structure
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
