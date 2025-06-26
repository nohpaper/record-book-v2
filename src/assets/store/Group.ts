import { create } from 'zustand'
import moment from 'moment';
import type { SaveField } from "../component/List.tsx";


//날짜순 type
interface CategoryType {
    id:number,
    useLength:number;
}
interface DateGroupUseType<T> {
    money: T | null;
    category?: CategoryType[];
}
interface DateGroupType<T> {
    date?: string | number | null;
    koreaName:string;
    moneyType: {
        income: DateGroupUseType<T>
        export: DateGroupUseType<T>
    }
}
interface DateGroup {
    total: {
        today: DateGroupType<number>;
        week:DateGroupType<number>;
        thisMonth: DateGroupType<number[]>;
        lastMonth?:DateGroupType<number[]>;
    }
    initUpdate: (todayTime:string)=> void;
    mathSum: (todayTime:string, saveField:SaveField)=> void;
    mathImsub: ()=> void;
}

//날짜순 store
export const useDateGroupStore = create<DateGroup>((set) => ({
    total: {
        today: {
            date:"",
            koreaName:"오늘",
            moneyType: {
                income: {
                    money:null,
                    category: [],
                },
                export: {
                    money:null,
                    category: [],
                },
            },
        },
        week: {
            date:null,
            koreaName:"주간",
            moneyType: {
                income: {
                    money:null,
                    category: [],
                },
                export: {
                    money:null,
                    category: [],
                },
            },
        },
        thisMonth: {
            date:null,
            koreaName:"월간",
            moneyType: {
                income: {
                    money:[],
                    category: [],
                },
                export: {
                    money:[],
                    category: [],
                },
            },
        },
        lastMonth: {
            koreaName:"저번달",
            moneyType: {
                income: {
                    money:[],
                    category: [],
                },
                export: {
                    money:[],
                    category: [],
                },
            },
        },
    },
    initUpdate: (todayTime) => set((state)=>{
        const total = { ...state.total };
        //오늘
        if(total.today.date === ""){
            //오늘 날짜가 공란일 경우
            total.today.date = todayTime;
        }else if(total.today.date !== todayTime){
            //일치하지 않을 경우
            //초기화시키고
            total.today.moneyType = {
                income: {
                    money:null, category: [],
                },
                export: {
                    money:null, category: [],
                },
            };
            //날짜 변경
            total.today.date = todayTime;
        }

        //주간
        //몇주인지 구하기
        const currentWeek = moment().local().week();
        const firstMonthWeek = moment().startOf('month').week();
        const week = currentWeek - firstMonthWeek + 1;

        if(total.week.date === "" || total.week.date === null){
            //오늘 날짜가 공란일 경우
            total.week.date = week;
        }else if(total.week.date !== week){
            //일치하지 않을 경우
            //초기화시키고
            total.week.moneyType = {
                income: {
                    money:null, category: [],
                },
                export: {
                    money:null, category: [],
                },
            };
            //주차 변경
            total.week.date = week;
        }

        //월간
        const month = moment().format("MM");
        if(total.thisMonth.date === "" || total.thisMonth.date === null){
            //오늘 날짜가 공란일 경우
            total.thisMonth.date = month;
        }else if(total.thisMonth.date !== week){
            //일치하지 않을 경우
            //초기화시키고
            total.thisMonth.moneyType = {
                income: {
                    money:[], category: [],
                },
                export: {
                    money:[], category: [],
                },
            };
            //주차 변경
            total.thisMonth.date = month;
        }

        return { total:state.total }
    }),
    mathSum: (todayTime, saveField) =>
        set((state) => {
            //*onSubmit 때 발동*
            //오늘 : todayTime 에 해당하는 리스트 (List.tsx) 에 있는 것만 +
            //주간 : (몇주)인지 확인, 일치할 경우 +
            //월간 : (몇주)인지 확인, 일치할 경우 해당 주차에 + => 모든 주간을 합계
            const total = state.total;
            const copyTotal = { ...total,
                today:{...total.today,
                    moneyType: {...total.today.moneyType,
                        income:{...total.today.moneyType.income,
                            category:total.today.moneyType.income.category
                                ? total.today.moneyType.income.category?.map(item => ({ ...item })) // 각 객체도 깊게 복사
                                : [],
                        },
                        export:{...total.today.moneyType.export,
                            category:total.today.moneyType.export.category
                                ? total.today.moneyType.export.category?.map(item => ({ ...item })) // 각 객체도 깊게 복사
                                : [],
                        }
                    },
                } , };
            const moneyCommaRemove = saveField.money !== null && saveField.money.replace(/,/g, "")

            //saveField.typeButton[].isActive:true 인 것 반환
            const activeKey = Object.keys(saveField.typeButton).find((key) => {
                const typeKey = key as keyof typeof saveField.typeButton;
                return saveField.typeButton[typeKey].isActive ? key : null;
            });

            //오늘
            if(copyTotal.today.date === todayTime && copyTotal.today.date !== ""){
                //일치하는 경우

                const typeKey = activeKey as keyof typeof copyTotal.today.moneyType;
                //moneyType[].money = saveField.money
                if(copyTotal.today.moneyType[typeKey].money !== null){
                    copyTotal.today.moneyType[typeKey].money += Number(moneyCommaRemove);
                }else {
                    copyTotal.today.moneyType[typeKey].money = Number(moneyCommaRemove);
                }

                //카테고리 관련
                if(saveField.category.id !== null){
                    //onSubmit 했을 때 값이 기입되어 있을 경우


                    //state.total.@@.category.id 확인

                    //없다면 --> 객체 추가
                    //있다면 --> 해당 객체 내부 수정
                    //두가지 모두 return 으로 값 받기

                    const copyCategory: CategoryType[] = copyTotal.today.moneyType[typeKey].category ?? [];

                    if(copyCategory){
                        //state.total.@@.category.id 확인
                        const findCategory = copyCategory?.find((element)=>element?.id === saveField.category.id);

                        if(findCategory === undefined){
                            //없다면 --> 객체 추가
                            console.log("없다면");

                            //객체 추가
                            copyCategory.push({
                                id:saveField.category.id,
                                useLength:1,
                            });
                        }else {
                            //있다면 --> 해당 객체 내부 수정

                            copyCategory.map((element)=>{
                                if(element.id === saveField.category.id){
                                    return {...element, useLength: element.useLength + 1}; //!!! +1되는 로직 반영 불가
                                }
                                return {...element};
                            });

                            console.log("있다면", findCategory, copyCategory);
                        }
                    }


                //!!!안되서 주석 start
/*                    const findCategory = copyTotal.today.moneyType[typeKey].category?.find((element)=>element?.id === saveField.category.id);

                    if(findCategory === undefined){
                       //total.today.moneyType[typeKey].category 내부에 해당 id가 있는지 체크 => 없을 경우
                        //1부터 시작

                        copyTotal.today.moneyType[typeKey].category?.push({
                            id:saveField.category.id,
                            useLength:1,
                        });
                    }else {
                        //있을 경우
                        //total.today.moneyType[typeKey].category 에서 해당하는 id의 객체를 가져옴
                        //객체.useLength 부분 ++
                        const currentCategory:CategoryType[] = copyTotal.today.moneyType[typeKey].category ?? [];

                        if(currentCategory){
                            const updateCategory = copyTotal.today.moneyType[typeKey].category?.map((element)=>{
                                if(element?.id === saveField.category.id){
                                    console.log("aaa", element);
                                    return {...element, useLength:element.useLength + 1};
                                }
                                return {...element};
                            });


                            const sortCategory = updateCategory?.filter((element): element is CategoryType => {
                                console.log("bbb", element);
                                    return element != null && typeof element.useLength === 'number' && typeof element.id === 'string'
                                }
                            )

                            console.log(sortCategory)
                            sortCategory?.sort((a, b) => {
                                console.log("ccc")
                                return (b.useLength) - (a.useLength)
                            });

                            if (typeKey === 'income') {
                                // income 객체도 다시 만들어 할당하여 불변성 유지
                                copyTotal.today.moneyType.income = {
                                    ...copyTotal.today.moneyType.income,
                                    category: sortCategory
                                };
                            } else if (typeKey === 'export') {
                                // export 객체도 다시 만들어 할당하여 불변성 유지
                                copyTotal.today.moneyType.export = {
                                    ...copyTotal.today.moneyType.export,
                                    category: sortCategory
                                };
                            }
                        }
                        console.log(copyTotal.today.moneyType[typeKey].category);

                    }*/
                    //!!!안되서 주석 end


                }
            }





/*            //몇주인지 구하기
            const currentWeek = moment().local().week();
            const firstMonthWeek = moment().startOf('month').week();
            const week = currentWeek - firstMonthWeek + 1;

            //주간
            if(total.week.date === week && total.week.date !== null){
                //일치하는 경우
                const typeKey = activeKey as keyof typeof total.week.moneyType;
                //moneyType[].money = saveField.money
                if(total.week.moneyType[typeKey].money !== null){
                    total.week.moneyType[typeKey].money += Number(moneyCommaRemove);
                }else {
                    total.week.moneyType[typeKey].money = Number(moneyCommaRemove);
                }
            }

            //월간
            const endMonthWeek = moment().endOf('month').week();
            let allWeek = endMonthWeek - firstMonthWeek + 1; //한달은 몇주있는지 확인
            allWeek = Math.max(4, Math.min(allWeek, 6));

            //몇주인지 확인하고, index - 1 자리에 money 기입
            const month = moment().format("MM");
            if(total.thisMonth.date === month && total.thisMonth.date !== null){
                //일치하는 경우
                const typeKey = activeKey as keyof typeof total.thisMonth.moneyType;
                //moneyType[].money = saveField.money
                if(total.thisMonth.moneyType[typeKey].money !== null){
                    if(total.thisMonth.moneyType[typeKey].money.length < allWeek){
                        total.thisMonth.moneyType[typeKey].money = new Array(allWeek).fill(0);
                    }
                    total.thisMonth.moneyType[typeKey].money[week - 1] += Number(moneyCommaRemove);
                }
            }
            console.log(total);*/

            return { total:copyTotal }
        }),
    mathImsub: () =>
        set((state) => {
            //*삭제 버튼 눌렀을 때 발동*
            //오늘 : 삭제하면 데이터에서 제거
            //주간 : (몇주)인지 확인, 일치할 경우 제거
            //월간 : (몇주)인지 확인, 일치할 경우 해당 주차에 - => 모든 주간을 합계

            return { total:state.total }
        }),
}));

//카테고리순 type
interface CategoryGroupType {
    id:number;
    color:string;
    koreaName:string;
    incomeMoney:number;
    exportMoney:number;
}
interface CategoryGroup {
    total: CategoryGroupType[];
    mathSum: ()=> void;
}

//카테고리순 store
export const useCategoryGroupStore = create<CategoryGroup>((set) => ({
    total: [
        {
            id:0,
            color:"",
            koreaName:"",
            incomeMoney:0,
            exportMoney:0,
        }
    ],
    mathSum: () =>
        set((state) => {
            return state
        }),
}));