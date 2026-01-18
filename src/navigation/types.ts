import { List, Item } from '../types';

export type RootStackParamList = {
    Home: undefined;
    CreateList: undefined;
    EditList: { list: List };
    ListDetail: { list: List };
    AddItem: { list: List };
    EditItem: { list: List; item: Item };
};