import { create } from 'zustand'
import moment from 'moment';
import type { SaveField, PushData } from "../component/List.tsx";
import type { DateListType } from "../store/List.tsx";


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
        today: DateGroupType<string>;
        week:DateGroupType<string>;
        thisMonth: DateGroupType<string[]>;
        lastMonth?:DateGroupType<string[]>;
    }
    initUpdate: (todayTime:string)=> void;
    mathSum: (todayTime:string, saveField:SaveField)=> void;
    mathImsub: (todayData: DateListType)=> void;
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
            const moneyCommaRemove = saveField.money !== null && saveField.money.replace(/,/g, "");

            //saveField.typeButton[].isActive:true 인 것 반환
            const activeKey = Object.keys(saveField.typeButton).find((key) => {
                const typeKey = key as keyof typeof saveField.typeButton;
                return saveField.typeButton[typeKey].isActive ? key : null;
            });

            const categoryLogic = (depth1type: string, depth2type: string) => {
                //카테고리 관련
                if(saveField.category.id !== null){
                    //onSubmit 했을 때 값이 기입되어 있을 경우


                    //state.total.@@.category.id 확인

                    //없다면 --> 객체 추가
                    //있다면 --> 해당 객체 내부 수정
                    //두가지 모두 return 으로 값 받기
                    const groupType = depth1type as keyof typeof copyTotal;
                    const money = depth2type as keyof typeof copyTotal.today.moneyType; //!!!
                    const copyCategory: CategoryType[] = copyTotal[groupType]?.moneyType[money].category ?? [];

                    if(copyCategory){
                        //state.total.@@.category.id 확인
                        const findCategory = copyCategory?.find((element)=>element?.id === saveField.category.id);

                        if(findCategory === undefined){
                            //없다면 --> 객체 추가
                            //객체 추가
                            copyCategory.push({
                                id:saveField.category.id,
                                useLength:1,
                            });
                        }else {
                            //있다면 --> 해당 객체 내부 수정

                            for (let index = 0; index < copyCategory.length; index++){
                                const element = copyCategory[index];

                                if (element.id !== saveField.category.id) {
                                    continue;
                                }

                                copyCategory[index] = {...element, useLength: element.useLength + 1};
                            }

                            //추가된 항목 정렬
                            copyCategory.sort((a, b) => {
                                return b.useLength - a.useLength;
                            });
                        }
                    }
                }
            }
            const categoryReset = (depth1type: string, depth2type: string)=>{
                const groupType = depth1type as keyof typeof copyTotal;
                const typeKey = depth2type as keyof typeof copyTotal.today.moneyType; //!!!
                const copyCategory: CategoryType[] = copyTotal[groupType]?.moneyType[typeKey].category ?? [];
                if(copyCategory){
                    copyCategory.length = 0;
                }
            }

            //오늘
            if(copyTotal.today.date === todayTime && copyTotal.today.date !== ""){
                //일치하는 경우
                const typeKey = activeKey as keyof typeof copyTotal.today.moneyType;
                //moneyType[].money = saveField.money
                if(copyTotal.today.moneyType[typeKey].money !== null){
                    //값 내부가 null 이 아닐 경우
                    const mathMoney = Number(copyTotal.today.moneyType[typeKey].money.replace(/,/g, "")) + Number(moneyCommaRemove); //콤마 제거한 saveField.money 내용 합산
                    copyTotal.today.moneyType[typeKey].money = mathMoney?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") ?? null; //해당 내용에 콤마 삽입
                }else {
                    //null 일 경우
                    //type string 에 string 내용 삽입
                    copyTotal.today.moneyType[typeKey].money = saveField.money?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") ?? null;
                }
                //카테고리
                categoryLogic("today", typeKey);
            }else {
                //일치하지 않을 경우
                //값 다시 넣기
                copyTotal.today.date = todayTime;

                //카테고리 초기화
                const typeKey = activeKey as keyof typeof copyTotal.today.moneyType;
                categoryReset("today", typeKey);
            }


            //몇주인지 구하기
            const currentWeek = moment().local().week();
            const firstMonthWeek = moment().startOf('month').week();
            const week = currentWeek - firstMonthWeek + 1;

            //주간
            if(copyTotal.week.date === week && copyTotal.week.date !== null){
                //일치하는 경우
                const typeKey = activeKey as keyof typeof total.week.moneyType;
                const weekMoney = copyTotal.week.moneyType[typeKey].money;
                //moneyType[].money = saveField.money
                if(weekMoney !== null){
                    const mathMoney = Number(weekMoney.replace(/,/g, "")) + Number(moneyCommaRemove); //콤마 제거한 saveField.money 내용 합산
                    copyTotal.week.moneyType[typeKey].money = mathMoney?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") ?? null; //해당 내용에 콤마 삽입
                }else {
                    copyTotal.week.moneyType[typeKey].money = saveField.money?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") ?? null;
                }
                categoryLogic("week", typeKey);
            }else {
                //일치하지 않을 경우
                //값 다시 넣기
                copyTotal.week.date = week;

                //카테고리 초기화
                const typeKey = activeKey as keyof typeof total.week.moneyType;
                categoryReset("today", typeKey);
            }

            //월간
            const endMonthWeek = moment().endOf('month').week();
            let allWeek = endMonthWeek - firstMonthWeek + 1; //한달은 몇주있는지 확인
            allWeek = Math.max(4, Math.min(allWeek, 6));

            //몇주인지 확인하고, index - 1 자리에 money 기입
            const month = moment().format("MM");
            if(copyTotal.thisMonth.date === month && copyTotal.thisMonth.date !== null){
                //일치하는 경우
                const typeKey = activeKey as keyof typeof copyTotal.thisMonth.moneyType;

                if(copyTotal.thisMonth.moneyType[typeKey].money !== null){
                    //null이 아닐 경우

                    if(copyTotal.thisMonth.moneyType[typeKey].money.length === 0) {
                        //월 주차만큼 배열 내부에 생성되어있지 않을 경우
                        //배열 내에 주차 갯수만큼 0으로 채우기
                        if (copyTotal.thisMonth.moneyType[typeKey].money.length < allWeek) {
                            copyTotal.thisMonth.moneyType[typeKey].money = new Array(allWeek).fill("");
                        }
                        //가져온 값 삽입
                        copyTotal.thisMonth.moneyType[typeKey].money[week - 1] = String(saveField.money);
                    }else {
                        const mathMoney = Number(copyTotal.thisMonth.moneyType[typeKey].money[week - 1]?.replace(/,/g, "")) + Number(moneyCommaRemove); //콤마 제거한 saveField.money 내용 합산
                        copyTotal.thisMonth.moneyType[typeKey].money[week - 1] = mathMoney?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") ?? null; //해당 내용에 콤마 삽입
                    }
                }
                categoryLogic("thisMonth", typeKey)
            }else {
                //일치하지 않을 경우
                //값 다시 넣기
                copyTotal.thisMonth.date = week;

                //카테고리 초기화
                const typeKey = activeKey as keyof typeof copyTotal.thisMonth.moneyType;
                categoryReset("today", typeKey);
            }

            return { total:copyTotal }
        }),
    mathImsub: (todayData) =>
        set((state) => {
            //*삭제 버튼 눌렀을 때 발동*
            //관련 객체 money, category
            //오늘 : 삭제하면 데이터에서 제거
            //주간 : (몇주)인지 확인, 일치할 경우 제거
            //월간 : (몇주)인지 확인, 일치할 경우 해당 주차에 - => 모든 주간을 합계
            //지난달 : 로직 없음

            /*오늘
            * today.money !== 0 일경우, list index 가 1이상일 경우
            * today.money.type (수입 or 지출) 확인하고, type 맞는 today.money 감액
            * category에서도 -1
            *
            * */
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
            const moneyCommaRemove = todayData.money !== null && todayData.money.replace(/,/g, "");

            //todayData.activeButton 에서 true인 key 반환
            const trueActiveButton= Object.keys(todayData.activeButton).find((element)=>element);
            const typeKey= trueActiveButton as keyof typeof todayData.activeButton;

            //월간
            //몇주인지 구하기
            const currentWeek = moment().local().week();
            const firstMonthWeek = moment().startOf('month').week();
            const week = currentWeek - firstMonthWeek + 1;

            if((trueActiveButton !== undefined) && copyTotal.today.moneyType[typeKey].money !== null && copyTotal.week.moneyType[typeKey].money !== null && copyTotal.thisMonth.moneyType[typeKey].money !== null){
                //수입 or 수출에 active 되어있다면
                //type string이기 때문에 콤마 제거 후 계산, 그리고 내용 삽입

                //오늘
                const todayMath = Number(copyTotal.today.moneyType[typeKey].money.replace(/,/g, "")) - Number(moneyCommaRemove);
                copyTotal.today.moneyType[typeKey].money = todayMath.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") ?? null;

                //주간w sad
                const weekMath = Number(copyTotal.week.moneyType[typeKey].money.replace(/,/g, "")) - Number(moneyCommaRemove);
                copyTotal.week.moneyType[typeKey].money = weekMath.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") ?? null;

                //이번달
                const thisMonthMath = Number(copyTotal.thisMonth.moneyType[typeKey].money[week - 1].replace(/,/g, "")) - Number(moneyCommaRemove);
                copyTotal.thisMonth.moneyType[typeKey].money[week - 1] = thisMonthMath.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") ?? null;

                if(copyTotal.today.moneyType[typeKey].money === "0"){
                    //!!! 타입 확인
                    //copyTotal.today.moneyType[typeKey].money = "";
                }

                //카테고리 관련
                // !!객체가 없을 수도 있음!!
                Object.keys(copyTotal).forEach((group)=>{
                    if(group !== "lastMonth"){
                        //저번달 제외
                        const groupKey = group as keyof typeof copyTotal;
                        const copyCategory = copyTotal[groupKey]?.moneyType[typeKey].category ?? [];

                        if(copyCategory){
                            //state.total.@@.category.id 확인
                            const findCategory = copyCategory?.find((element)=>element?.id === todayData.categoryID);

                            if(findCategory !== undefined){
                                //있다면
                                if(findCategory.useLength > 1){
                                    //true 고 useLength 가 2 이상이라면 -1
                                    for (let index = 0; index < copyCategory.length; index++){
                                        const element = copyCategory[index];

                                        if (element.id !== todayData.categoryID) {
                                            continue;
                                        }

                                        copyCategory[index] = {...element, useLength: element.useLength - 1};
                                    }
                                }else {
                                    //true 고 useLength 가 1이라면 -1 및 객체 삭제
                                    for (let index = 0; index < copyCategory.length; index++){
                                        const element = copyCategory[index];

                                        if (element.id !== todayData.categoryID) {
                                            continue;
                                        }
                                        copyCategory.splice(index, 1);
                                    }
                                }
                            }
                            //객체가 없다면 로직 없음
                        }
                    }
                });
            }


            return { total:copyTotal }
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
    updateInfo: (pushArray:PushData[])=> void;
    mathSum: ()=> void;
}

//카테고리순 store
export const useCategoryGroupStore = create<CategoryGroup>((set) => ({
    total: [
        {
            id:0,
            color:"#FFA742",
            koreaName:"기본 카테고리1",
            incomeMoney:0,
            exportMoney:0,
        },
        {
            id:1,
            color:"#9EF284",
            koreaName:"기본 카테고리2",
            incomeMoney:0,
            exportMoney:0,
        },
        {
            id:2,
            color:"#B560F5",
            koreaName:"기본 카테고리3",
            incomeMoney:0,
            exportMoney:0,
        },
        {
            id:3,
            color:"#030417",
            koreaName:"기본 카테고리4",
            incomeMoney:0,
            exportMoney:0,
        }
    ],
    updateInfo: (pushArray)=> set((state)=>{
        //name이 변경되었을 경우 변경
        const total = state.total;

        const copyTotal = total.map((element, index)=>{
            //가져온 배열객체.id 와 state.total.id를 대조
            if(element.id === pushArray[index].id && element.koreaName === pushArray[index].koreaName){
                //id가 같고 koreaName 이 같을 경우 패스
                console.info("변경될 내용 없음");
            }else {
                //name 변경
                console.log("다름", element);
                element.koreaName = pushArray[index].koreaName;

                return element;
            }
            return element;
        });

        return {total:copyTotal};
    }),
    mathSum: () =>
        set((state) => {
            return state
        }),
}));