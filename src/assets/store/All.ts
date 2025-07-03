import { create } from 'zustand';

export const useActivePaletteStore = create(() => ({
    palette : {
        income: {
            button:"text-[#DF2121] bg-[#FFC2C2]",
            text:"text-[#DF2121]",
        },
        export: {
            button:"text-[#1E82AC] bg-[#C1F6FF]",
            text:"text-[#1E82AC]",
        },
    }
}));
interface CategoryList {
    id:number;
    isActive: boolean;
    color:string;
    name:string;
}
interface Category {
    list: CategoryList[];
    activeChange: (index:number)=>void;
    nameChange: (value:string)=>void;
}
export const useCategoryStore = create<Category>((set) => ({
    list: [
        {
            id:0,
            isActive:true,
            color:"#FFA742",
            name:"기본 카테고리1",
        },
        {
            id:1,
            isActive:false,
            color:"#9EF284",
            name:"기본 카테고리2",
        },
        {
            id:2,
            isActive:false,
            color:"#B560F5",
            name:"기본 카테고리3",
        },
        {
            id:3,
            isActive:false,
            color:"#030417",
            name:"기본 카테고리4",
        },
    ],
    activeChange: (index)=>{
        set((state) => {
            const list = state.list;
            const copyCategory = list.map((item, subIndex)=>{
                item.isActive = false;

                if(index === subIndex){
                    item.isActive = !item.isActive;
                }
                return item;
            });

            return { list:copyCategory };
        })
    },
    nameChange: (value)=>{
        set((state) => {
            const list = state.list;

            const changeName = list.map((element)=>{
                if(element.isActive){
                    element.name = value;
                }
                return element;
            });
            return { list:changeName };
        })
    }
}))