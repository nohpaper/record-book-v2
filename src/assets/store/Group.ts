import { create } from 'zustand'
import { persist } from 'zustand/middleware'
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
export const useDateGroupStore = create<DateGroup>()(
    persist(
        (set) => ({
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
            },
            initUpdate: (todayTime) => set((state)=>{
                const total = state.total;
                const copyTotal = {
                    ...total,
                    thisMonth:{
                        ...total.thisMonth,
                        moneyType: {
                            income: {...total.thisMonth.moneyType.income,},
                            export: {...total.thisMonth.moneyType.export,},
                        }
                    },
                    ...(total.lastMonth
                        ? {
                            lastMonth: {
                                ...total.lastMonth,
                                moneyType: {
                                    income: { ...total.lastMonth.moneyType.income },
                                    export: { ...total.lastMonth.moneyType.export },
                                },
                            },
                        }
                        : {})
                };
                //오늘
                if(copyTotal.today.date === ""){
                    //오늘 날짜가 공란일 경우
                    copyTotal.today.date = todayTime;
                }else if(total.today.date !== todayTime){
                    //copyTotal 않을 경우
                    //초기화시키고
                    copyTotal.today.moneyType = {
                        income: {
                            money:null, category: [],
                        },
                        export: {
                            money:null, category: [],
                        },
                    };
                    //날짜 변경
                    copyTotal.today.date = todayTime;
                }

                //주간
                //몇주인지 구하기
                const currentWeek = moment().local().week();
                const firstMonthWeek = moment().startOf('month').week();
                const week = currentWeek - firstMonthWeek + 1;

                if(copyTotal.week.date === "" || copyTotal.week.date === null){
                    //오늘 날짜가 공란일 경우
                    copyTotal.week.date = week;
                }else if(copyTotal.week.date !== week){
                    //일치하지 않을 경우
                    //초기화시키고
                    copyTotal.week.moneyType = {
                        income: {
                            money:null, category: [],
                        },
                        export: {
                            money:null, category: [],
                        },
                    };
                    //주차 변경
                    copyTotal.week.date = week;
                }

                //월간
                const month = moment().format("MM");
                if(copyTotal.thisMonth.date === "" || copyTotal.thisMonth.date === null){
                    //오늘 날짜가 공란일 경우
                    copyTotal.thisMonth.date = month;
                }else if(copyTotal.thisMonth.date !== month){
                    //일치하지 않을 경우
                    //초기화시키고
                    copyTotal.thisMonth.moneyType = {
                        income: {
                            money:[], category: [],
                        },
                        export: {
                            money:[], category: [],
                        },
                    };
                    //주차 변경
                    copyTotal.thisMonth.date = month;
                }


                /*
                * 페이지 진입 시 저번달 노출 및 데이터 이관 관련(250808 확인 사항 4번)
                * 1. 페이지 진입 시 월간이 변경된지 확인 (해당 부분은 2번 로직이 완료된 후 코드 추가 예정)
                * 2. 변경되었다면 월간 내용을 저번달로 이동하고, 월간 내용 초기화
                *   => 현재 동시작동으로 둘다 내용 초기화됨
                * */

                //저번달
                //total.thisMonth.date 의 값과 month = moment().format("MM"); 값 확인
                copyTotal.lastMonth = {
                    koreaName:"저번달",
                    moneyType: {
                        income: {
                            money:[...(copyTotal.thisMonth.moneyType.income.money ?? [])],
                            category: [...(copyTotal.thisMonth.moneyType.income.category) ?? []],
                        },
                        export: {
                            money:[...(copyTotal.thisMonth.moneyType.export.money) ?? []],
                            category: [...(copyTotal.thisMonth.moneyType.export.category) ?? []],
                        },
                    },
                };

                //월간 초기화
                copyTotal.thisMonth = {
                    ...copyTotal.thisMonth,
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
                }

                if(copyTotal.thisMonth.date !== "" && copyTotal.thisMonth.date !== month){
                    //total.thisMonth.date 의 값이 공란이 아니고 month 와 다를 경우

                }

                return { total:copyTotal }
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
        }),
        {
            name:"group-date"
        }
    )
);


//카테고리순 type
interface CategoryGroupType {
    id:number;
    color:string;
    koreaName:string;
    incomeMoney:string;
    exportMoney:string;
}
interface CategoryGroup {
    date: string | null;
    total: CategoryGroupType[];
    initUpdate: (todayTime:string,)=> void;
    updateInfo: (pushArray:PushData[])=> void;
    mathSum: (todayTime:string, saveField:SaveField)=> void;
    mathImsub: (todayData: DateListType)=> void;
}

/*
*   카테고리 이름 변경 후 (로컬스토리지 저장 후) 페이지 진입 시 변경된 이름 반영 관련(250808 확인 사항 2번 2-1)
       - 확인 사항 1번과 연관
    1. 로컬 스토리지를 불러와서 하는 것밖에 없나?
    * 카테고리 이름 수집 store 를 괜히 분리해서 쓸데없는 코스트(로컬스토리지 불러오기) 하는 것 아닐까?
    * - 다른 카테고리 관련 store 는 (250808 확인 사항 2번 2-2)로 검색
* */
//카테고리순 store
export const useCategoryGroupStore = create<CategoryGroup>()(
    persist(
        (set) => ({
            date:null,
            total: [
                {
                    id:0,
                    color:"#FFA742",
                    koreaName:"기본 카테고리1",
                    incomeMoney:"0",
                    exportMoney:"0",
                },
                {
                    id:1,
                    color:"#9EF284",
                    koreaName:"기본 카테고리2",
                    incomeMoney:"0",
                    exportMoney:"0",
                },
                {
                    id:2,
                    color:"#B560F5",
                    koreaName:"기본 카테고리3",
                    incomeMoney:"0",
                    exportMoney:"0",
                },
                {
                    id:3,
                    color:"#030417",
                    koreaName:"기본 카테고리4",
                    incomeMoney:"0",
                    exportMoney:"0",
                }
            ],
            initUpdate: (todayTime)=>set((state)=>{
                const date = state.date;
                const total = state.total;

                let newDate: string|null = null;
                let copyTotal = [...total];
                if(date !== null && date !== todayTime.split("-")[1]){
                    //값이 있으나 date 와 다를 경우
                    //카테고리순 초기화
                    copyTotal = total.map((element)=>{
                        element.incomeMoney = "0";
                        element.exportMoney = "0";
                        return element;
                    });

                    //date 값 변경
                    newDate = todayTime.split("-")[1];
                }else if(date !== null && date === todayTime.split("-")[1]){
                    //값이 있으나 date 와 같을 경우 변동 로직 없음
                }else{
                    //그 외 로직 없음
                }
                return {date:newDate, total:copyTotal};
            }),
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
            mathSum: (todayTime, saveField) =>
                set((state) => {
                    const date = state.date;
                    const total = state.total;

                    let newDate: string|null = null;
                    let copyTotal = [...total];

                    if(date !== null && date !== todayTime.split("-")[1]){
                        //값이 있으나 가져온 값과 다를 경우

                        //카테고리순 초기화
                        copyTotal = total.map((element)=>{
                            element.incomeMoney = "0";
                            element.exportMoney = "0";
                            return element;
                        });

                        //date 값 변경
                        newDate = todayTime.split("-")[1];
                    }else {
                        //값이 없거나 / 값이 있고 가져온 값과 같을 경우
                        if(date === null){
                            //값이 없을 경우 삽입
                            newDate = todayTime.split("-")[1];
                        }

                        //isActive:true 인 key 값 확인 변수
                        const activeKey = Object.keys(saveField.typeButton).find((key) => {
                            const typedKey = key as keyof typeof saveField.typeButton;
                            return saveField.typeButton[typedKey].isActive;
                        });

                        if(saveField.category.id !== null){
                            //SaveField category.id 값이 null이 아닐 경우
                            copyTotal = total.map((element)=>{
                                if(saveField.category.id === element.id){
                                    //가져온 값.category.id 와 element.id 가 동일할 경우
                                    if(activeKey === "income"){
                                        //수입
                                        const mathMoney = Number(element.incomeMoney?.replace(/,/g, "")) + Number(saveField.money?.replace(/,/g, ""));//쉼표(콤마) 제거
                                        element.incomeMoney = mathMoney?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") ?? null;//합산한 값에 쉼표(콤마) 삽입
                                    }else if(activeKey === "export"){
                                        //지출
                                        const mathMoney = Number(element.exportMoney?.replace(/,/g, "")) + Number(saveField.money?.replace(/,/g, ""));//쉼표(콤마) 제거
                                        element.exportMoney = mathMoney?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") ?? null;//합산한 값에 쉼표(콤마) 삽입
                                    }else{
                                        //확인 불가
                                    }
                                    return element;
                                }
                                return element;
                            })
                        }
                    }

                    /*
                    * 1. state.map(element.id)를 확인하여 가져온 category.id와 같은 게 있는 지 확인
                    * 2. 같은 게 있을 경우 해당 객체에 값 합산
                    *       2-1. SaveField.typeButton 내부 확인 후 true 있는지 확인
                    *       2-2. true 값 가져와서 element 내부 알맞은 Money에 합산
                    *
                    * */
                    return {date:newDate, total:copyTotal};
                }),
            mathImsub:(todayData)=>set((state)=>{
                const total = state.total;

                //true 인 key 값 확인 변수
                const activeKey = Object.keys(todayData.activeButton).find(() => todayData.activeButton);
                let copyTotal = [...total];

                if(todayData.categoryID !== null){
                    //categoryID 가 있을 경우
                    copyTotal = total.map((element)=>{
                        if(element.id === todayData.categoryID){
                            //id 동일한 것이 있을 경우
                            if(activeKey === "income"){
                                //수입
                                const mathMoney = Number(element.incomeMoney?.replace(/,/g, "")) - Number(todayData.money?.replace(/,/g, ""));//쉼표(콤마) 제거
                                element.incomeMoney = mathMoney?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") ?? null;//값에 쉼표(콤마) 삽입
                            }else if(activeKey === "export") {
                                //지출
                                const mathMoney = Number(element.exportMoney?.replace(/,/g, "")) - Number(todayData.money?.replace(/,/g, ""));//쉼표(콤마) 제거
                                element.exportMoney = mathMoney?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") ?? null;//값에 쉼표(콤마) 삽입
                            }else {
                                //에러
                            }
                            return element;
                        }else{
                            //id 동일한 것이 없을 경우 변동사항 없음
                        }
                        return element;
                    });
                }else {
                    //categoryID 가 없을 경우(값이 null 일 경우) 카테고리순 변동사항 없음
                }
                return {total:copyTotal};
            })
        }),
        {
            name:"group-category"
        }
    )
);