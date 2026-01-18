import { List } from '../types';

export type RootStackParamList = {
    Home: undefined;
    CreateList: undefined;
    ListDetail: { list: List };
    AddItem: { list: List };
};