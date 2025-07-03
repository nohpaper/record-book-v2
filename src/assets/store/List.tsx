import { create } from 'zustand';
import moment from "moment/moment";
import type { SaveField } from "../component/List.tsx";

export interface DateListType {
    id:number;
    isDeleted:boolean;
    activeButton: {
        income: boolean;
        export: boolean;
    }
    money:string | null;
    categoryID:number | null;
    memo:string;
}
interface DateList {
    today: {
        date:string;
        list: DateListType[];
    }[];
    listArrangement:(SaveField: SaveField)=>void;
    deleteItem:(deleteID: number)=>void;
}
export const useDateListStore = create<DateList>((set) => ({
    today: [
        {
            date:"2025-06-17",
            list: [
                {
                    id:0,
                    isDeleted:false,
                    activeButton:{
                        income:false,
                        export:false,
                    },
                    money:"7,000",
                    categoryID:0,
                    memo:"asdasd",
                },
            ],
        },

    ],
    listArrangement: (saveField)=> set((state)=>{
        const today = state.today;
        const todayTime = moment().format("YYYY-MM-DD");
        //const moneyComma = saveField.money !== null && saveField.money.replace(/,/g, "")
        const moneyCommaAdd = saveField.money?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") ?? null;

        //들어온 데이터 가공
        const pushData = {
            id:saveField.id,
            isDeleted:false,
            activeButton:{
                income:saveField.typeButton.income.isActive,
                export:saveField.typeButton.export.isActive,
            },
            money:moneyCommaAdd,
            categoryID:saveField.category.id,
            memo:saveField.memo,
        }

        const addToday = today.map((element)=>{
            if(element.date === todayTime){
                //있을 경우
                //해당 날짜 list 배열 내부 마지막에 객체 추가
                return {...element, list: [...element.list, pushData] }
            }
            return element;
        });

        if(!today.some((element)=>element.date === todayTime)){
            //없을 경우
            const newDate = {
                date:todayTime,
                list:[pushData],
            }
            addToday.push(newDate);
        }

        return { today:addToday }
    }),
    deleteItem: (deleteID)=> set((state)=>{
        const today = state.today;
        const todayTime = moment().format("YYYY-MM-DD");

        const deleteToday = today.map((element)=>{
            if(element.date === todayTime){
                //있을 경우(무조건 있음)
                //list 에서 deleteID 와 id가 동일한 객체를 찾고
                const deleteItem = element.list.filter((item)=>item.id === deleteID);
                deleteItem[0].isDeleted = true;
                return {...element, list: [...element.list] }
            }
            return element;
        });

        return { today:deleteToday }
    }),
}));