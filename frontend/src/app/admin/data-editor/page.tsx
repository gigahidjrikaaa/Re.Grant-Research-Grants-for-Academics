// frontend/src/app/(admin)/data-editor/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  listManageableTables,
  getTableSchema,
  getTableData,
  createTableRow,
  updateTableRow,
  deleteTableRow,
  type TableSchemaResponse,
} from '@/lib/apiAdminService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // For search/filter later
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
//   DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox'; // For boolean fields
import { Loader2, Edit, Trash2, PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useForm, Controller, SubmitHandler } from 'react-hook-form'; // For forms
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Helper to determine input type from schema type
const getInputTypeFromSchema = (schemaType: string): React.HTMLInputTypeAttribute | 'textarea' | 'checkbox' | 'json' | 'array' => {
  const typeLower = schemaType.toLowerCase();
  if (typeLower.includes('int') || typeLower.includes('numeric') || typeLower.includes('float') || typeLower.includes('double')) return 'number';
  if (typeLower.includes('bool')) return 'checkbox';
  if (typeLower.includes('date') && !typeLower.includes('timestamp')) return 'date';
  if (typeLower.includes('timestamp') || typeLower.includes('datetime')) return 'datetime-local';
  if (typeLower.includes('text')) return 'textarea';
  if (typeLower.includes('json')) return 'json'; // Will need special handling (textarea)
  if (typeLower.includes('array')) return 'array'; // Will need special handling (e.g., comma-separated input)
  return 'text';
};


export default function AdminDataEditorPage() {
  const { token } = useAuth();
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableSchema, setTableSchema] = useState<TableSchemaResponse | null>(null);
  const [tableData, setTableData] = useState<Record<string, unknown>[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10); // Or allow user to change
  const [isLoadingTables, setIsLoadingTables] = useState(true);
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<Record<string, unknown> | null>(null); // For editing, null for new row

  // react-hook-form setup
  const { control, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<Record<string, unknown>>();

  // Fetch tables
  useEffect(() => {
    if (token) {
      setIsLoadingTables(true);
      listManageableTables(token)
        .then(setTables)
        .catch(err => toast.error(`Failed to load tables: ${err.message}`))
        .finally(() => setIsLoadingTables(false));
    }
  }, [token]);

  // Fetch schema when table selected
  useEffect(() => {
    if (selectedTable && token) {
      setIsLoadingSchema(true);
      setTableData([]); // Clear previous data
      setTableSchema(null);
      setCurrentPage(1); // Reset page
      getTableSchema(selectedTable, token)
        .then(setTableSchema)
        .catch(err => toast.error(`Failed to load schema for ${selectedTable}: ${err.message}`))
        .finally(() => setIsLoadingSchema(false));
    }
  }, [selectedTable, token]);

  // Fetch data when table/schema/page changes
  const fetchData = useCallback(() => {
    if (selectedTable && tableSchema && token) {
      setIsLoadingData(true);
      getTableData(selectedTable, token, currentPage, pageSize)
        .then(response => {
          setTableData(response.data);
          setTotalRows(response.total_rows);
        })
        .catch(err => toast.error(`Failed to load data for ${selectedTable}: ${err.message}`))
        .finally(() => setIsLoadingData(false));
    }
  }, [selectedTable, tableSchema, token, currentPage, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]); // fetchData is memoized with useCallback

  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName);
  };

  const openFormModal = (row?: Record<string, unknown>) => {
    setEditingRow(row || null); // If row is provided, it's an edit operation
    reset(row || {}); // Reset form with row data or empty for new
    setIsFormOpen(true);
  };

  const onFormSubmit: SubmitHandler<Record<string, unknown>> = async (data) => {
    if (!selectedTable || !token || !tableSchema) return;

    // Convert empty strings to null for optional fields, handle type conversions
    const processedData: Record<string, unknown> = {};
    tableSchema.columns.forEach(col => {
      let value = data[col.name];
      const inputType = getInputTypeFromSchema(col.type);

      if (value === '' && !col.name.endsWith('_id') && col.type.toLowerCase() !== 'text' && !col.type.toLowerCase().startsWith('varchar')) { // Allow empty text/varchar
          // Heuristic: if not a text-like field or ID, empty string might mean NULL
          // This needs to be more robust based on your DB constraints (nullable fields)
          value = null;
      }
      if (inputType === 'number' && value !== null && value !== undefined && value !== '') {
        value = Number(value);
      }
      if (inputType === 'checkbox') {
        value = Boolean(value);
      }
      // Handle JSON or ARRAY inputs (e.g., parse from string)
      if ((inputType === 'json' || inputType === 'array') && typeof value === 'string') {
        try {
            value = JSON.parse(value);
        } catch (e) {
            console.error(`Invalid JSON/Array format for ${col.name}:`, e);
            toast.error(`Invalid JSON/Array format for ${col.name}`);
            // errors[col.name] = { type: 'manual', message: 'Invalid JSON/Array format' }; // Doesn't work directly
            return; // Stop submission
        }
      }
      processedData[col.name] = value;
    });


    try {
      if (editingRow && editingRow[tableSchema.primary_keys[0]]) { // Assuming single PK for now
        const pkValue = editingRow[tableSchema.primary_keys[0]] as string | number;
        await updateTableRow(selectedTable, pkValue, processedData, token);
        toast.success(`Row ${pkValue} in ${selectedTable} updated successfully!`);
      } else {
        await createTableRow(selectedTable, processedData, token);
        toast.success(`New row added to ${selectedTable} successfully!`);
      }
      fetchData(); // Refresh data
      setIsFormOpen(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`Failed to save row: ${error.message}`);
      } else {
        toast.error(`Failed to save row: ${String(error)}`);
      }
    }
  };

  const handleDeleteRow = async (row: Record<string, unknown>) => {
    if (!selectedTable || !token || !tableSchema || tableSchema.primary_keys.length === 0) return;
    const pkField = tableSchema.primary_keys[0]; // Assuming single PK
    const rowId = row[pkField] as string | number;

    if (window.confirm(`Are you sure you want to delete row with ID ${rowId} from ${selectedTable}?`)) {
      try {
        await deleteTableRow(selectedTable, rowId, token);
        toast.success(`Row ${rowId} deleted successfully from ${selectedTable}.`);
        fetchData(); // Refresh data
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(`Failed to delete row: ${error.message}`);
        } else {
          toast.error(`Failed to delete row: ${String(error)}`);
        }
      }
    }
  };


  if (isLoadingTables) {
    return <div className="p-4 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /> Loading tables...</div>;
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary">Admin Data Editor</h1>
        <p className="text-text-muted">Directly manage your application&apos;s database tables.</p>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Table</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleTableSelect} value={selectedTable || ""}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Choose a table to manage" />
            </SelectTrigger>
            <SelectContent>
              {tables.map(table => (
                <SelectItem key={table} value={table}>{table}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedTable && (isLoadingSchema || isLoadingData) && (
        <div className="p-4 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /> Loading table details...</div>
      )}

      {selectedTable && tableSchema && !isLoadingData && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="capitalize">{selectedTable} Data</CardTitle>
                <CardDescription>Total Rows: {totalRows}</CardDescription>
            </div>
            <Button onClick={() => openFormModal()} size="sm">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Row
            </Button>
          </CardHeader>
          <CardContent>
            {tableData.length === 0 ? (
              <p className="text-text-muted text-center py-4">No data available in this table.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {tableSchema.columns.map(col => (
                        <TableHead key={col.name} className="whitespace-nowrap">{col.name}</TableHead>
                      ))}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {tableSchema.columns.map(col => (
                          <TableCell key={col.name} className="whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis">
                            {typeof row[col.name] === 'boolean' ? (row[col.name] ? 'True' : 'False') : 
                             row[col.name] === null || row[col.name] === undefined ? <span className="italic text-text-muted">NULL</span> : 
                             String(row[col.name])}
                          </TableCell>
                        ))}
                        <TableCell className="text-right space-x-2 whitespace-nowrap">
                          <Button variant="outline" size="sm" onClick={() => openFormModal(row)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteRow(row)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {/* Pagination Controls */}
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || isLoadingData}
              >
                <ChevronLeft className="h-4 w-4"/> Previous
              </Button>
              <span className="text-sm text-text-muted">
                Page {currentPage} of {Math.ceil(totalRows / pageSize)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage * pageSize >= totalRows || isLoadingData}
              >
                Next <ChevronRight className="h-4 w-4"/>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Modal/Dialog for Editing/Creating Rows */}
      {tableSchema && (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRow ? `Edit Row in ${selectedTable}` : `Add New Row to ${selectedTable}`}</DialogTitle>
              <DialogDescription>
                {editingRow && tableSchema.primary_keys.length > 0 &&
                  `Editing row with ${tableSchema.primary_keys[0]}: ${editingRow[tableSchema.primary_keys[0]]}`
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onFormSubmit)} className="grid gap-4 py-4">
              {tableSchema.columns.map(col => {
                // Do not render PK field if it's auto-generated and we are editing
                // (or make it read-only)
                // For creation, some PKs might be user-supplied if not serial.
                const isPrimaryKey = tableSchema.primary_keys.includes(col.name);
                const inputType = getInputTypeFromSchema(col.type);

                if (isPrimaryKey && editingRow && !col.name.includes("id")) { // Simple heuristic: don't allow editing non-'id' PKs for now
                  // Or if it's a serial 'id' during creation, often not shown or auto-filled
                  // This logic needs refinement based on your PK strategy
                }

                return (
                  <div key={col.name} className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor={col.name} className="text-right col-span-1">
                      {col.name} <span className="text-text-muted text-xs">({col.type})</span>
                      {isPrimaryKey && <span className="text-primary-blue ml-1 text-xs">(PK)</span>}
                    </Label>
                    <div className="col-span-3">
                      <Controller
                        name={col.name}
                        control={control}
                        defaultValue={editingRow?.[col.name] ?? (inputType === 'checkbox' ? false : '')}
                        render={({ field }) => {
                          if (inputType === 'textarea') {
                            return <Textarea 
                              {...field} 
                              value={field.value != null ? String(field.value) : ''}
                              placeholder={`Enter ${col.name}`} 
                              className={errors[col.name] ? "border-destructive" : ""} 
                            />;
                          }
                          if (inputType === 'checkbox') {
                            return (
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={col.name}
                                  checked={Boolean(field.value)}
                                  onCheckedChange={field.onChange}
                                />
                                <label htmlFor={col.name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                  {col.name}
                                </label>
                              </div>
                            );
                          }
                          if (inputType === 'json' || inputType === 'array') {
                            // Convert field.value to string to satisfy Textarea's type requirements
                            const valueString = field.value !== null && field.value !== undefined 
                              ? (typeof field.value === 'string' 
                                ? field.value 
                                : JSON.stringify(field.value, null, 2))
                              : '';
                            return <Textarea 
                              {...field} 
                              value={valueString}
                              placeholder={`Enter valid JSON/Array for ${col.name}`} 
                              rows={3}  
                              className={errors[col.name] ? "border-destructive" : ""} 
                            />;
                          }
                          // For datetime-local, ensure value is correctly formatted if default is provided
                          let valueForInput = field.value;
                          if (inputType === 'datetime-local' && field.value && typeof field.value === 'string') {
                            // Attempt to format for datetime-local input if it's a full ISO string
                            try {
                                valueForInput = field.value.substring(0, 16); // YYYY-MM-DDTHH:mm
                            } catch (e) { console.error(`Error formatting datetime-local value for ${col.name}:`, e); }
                          }
                          
                          // Convert valueForInput to appropriate type for Input component
                          const inputValue = valueForInput !== null && valueForInput !== undefined 
                            ? String(valueForInput) 
                            : '';
                            
                          return <Input 
                            {...field} 
                            type={inputType} 
                            placeholder={`Enter ${col.name}`} 
                            value={inputValue}  
                            className={errors[col.name] ? "border-destructive" : ""} 
                            disabled={isPrimaryKey && !!editingRow}
                          />;
                        }}
                      />
                       {errors[col.name] && <p className="text-xs text-destructive mt-1">{errors[col.name]?.message as string}</p>}
                    </div>
                  </div>
                );
              })}
              <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingRow ? 'Save Changes' : 'Create Row'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}