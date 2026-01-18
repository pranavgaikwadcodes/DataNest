export type FieldType = 'text' | 'number' | 'date' | 'boolean';

export interface Field {
    name: string;
    type: FieldType;
    required: boolean;
}

export interface ListSchema {
    fields: Field[];
}

export interface List {
    id: string;
    name: string;
    schema: ListSchema;
    created_at: string;
}

export interface Item {
    id: string;
    list_id: string;
    data: Record<string, any>;
    created_at: string;
}