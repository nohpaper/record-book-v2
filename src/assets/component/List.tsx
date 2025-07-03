import {useEffect, useState} from "react";
import moment from 'moment';
import { useDateListStore } from "../store/List.tsx";
import {useActivePaletteStore, useCategoryStore} from "../store/All.ts";
import {useDateGroupStore} from "../store/Group.ts";

// 5px -> 0.26vw
// 10px -> 0.521vw
// 12px -> 0.625vw
// 14px -> 0.729vw
// 16px -> 0.833vw
// 20px -> 1.042vw
// 24px -> 1.25vw
// 34px -> 1.771vw
// 40px -> 2.083vw
// 64px -> 3.333vw
// 70px -> 3.646vw
// 90px -> 4.688vw

// TODO :: list에 카테고리 반영 및 zustand에 전송!

//색상 변경 관련 배열
interface ChangeInput {
    money:string | null,
    memo:string,
}
export interface SaveField {
    id:number,
    typeButton: {
        income: {
            isActive: boolean,
        },
        export: {
            isActive: boolean,
        }
    },
    money:string | null,
    category: {
        id:number | null,
        color:string,
        name:string,
    },
    memo:string,
}
const todayTime = moment().format("YYYY-MM-DD");

export default function List(){
    //ALL.tsx
    const activePalette = useActivePaletteStore((state) => state.palette);
    const category = useCategoryStore((state) => state.list);
    const categoryActiveChange = useCategoryStore((state) => state.activeChange);
    const categoryNameChange = useCategoryStore((state) => state.nameChange);

    //List.tsx
    const todayList = useDateListStore((state) => state.today);
    const listArrangement = useDateListStore((state) => state.listArrangement);
    const deleteItem = useDateListStore((state) => state.deleteItem); //삭제 관련 store

    //group.tsx
    const initUpdate = useDateGroupStore((state) => state.initUpdate);
    const mathSum = useDateGroupStore((state) => state.mathSum);
    const mathImsub = useDateGroupStore((state) => state.mathImsub);

    //클릭하는 타입들 useState
    const [clickType, setClickType] = useState({
        typeButton:{
            income: {
                KoreaName:"수입", //string
                isActive: false, //boolean
            },
            export: {
                KoreaName:"지출", //string
                isActive: false,  //boolean
            }
        }
    });
    //changeInput useState (금액, 메모)
    const [changeInput, setChangeInput] = useState<ChangeInput>({
        money:null,
        memo:"",
    });
    const [isViewCategory, setIsViewCategory] = useState({
        first: false,
        always: false,
    });
    //입력란에 있는 내용으로 삽입 및 변경됨. +버튼을 누르면 zustand store으로 이동, 성공 후 초기화
    const [saveField, setSaveField] = useState<SaveField>({
        id:-1, //number
        typeButton: {
            income: {
                isActive: false, //boolean
            },
            export: {
                isActive: false,  //boolean
            }
        },
        money:null, //number | null
        category: {
            id:null, //number | null
            color:"", //string
            name:"", //string
        },
        memo:"", //string
    });

    //state.today 에서 오늘 날짜를 가진 객체 찾기
    const todayData = todayList.find((element)=>element.date === todayTime);
    //카테고리 선택관련 .isActive true 찾기
    const categoryIsActive = category.find((element)=>element.isActive);


    const [isSubmitButton, setIsSubmitButton] = useState(false); //form 태그 onSubmin 발동 시 애니메이션 발동

    useEffect(() => {
        initUpdate(todayTime);
    }, []);
    return (
    <div className="pt-[3.333vw]">
        {/* 입력란 */}
        <form onSubmit={(event) => {
            event.preventDefault();
            setIsSubmitButton(true);

            //id ++
            //money, memo -> changeInput 에서 값 가져오기
            //category -> category 에서 값 가져오기
            const copySaveField = {...saveField,
                typeButton: {
                ...saveField.typeButton,
                    income: {...saveField.typeButton.income},
                    export: {...saveField.typeButton.export} },
                category: {...saveField.category}
            };

            const copyChangeInput = {...changeInput};
            const checkButtonBoolean = Object.values(clickType.typeButton).map((element)=>element.isActive); //내용 삽입 전이기때문에 clickType 내용으로 판단
            //금액 단위로 볼 수 없는 경우들 체크
            const checkMoneyOnlyZero = /^0+$/.test(String(changeInput.money));
            const checkMoneyStartZero = String(changeInput.money).length > 1 && String(changeInput.money).startsWith('0');

            if(!checkButtonBoolean.includes(true) || (changeInput.money === null || changeInput.money === "")) {
                //true가 없을 경우
                alert("수입/지출 버튼과 금액을 입력해주세요");
            }else if(checkMoneyOnlyZero || checkMoneyStartZero) {
                //금액이 0, 000, 0001, 023 같이 금액 단위으로 볼 수 없을 경우
                alert("바른 금액을 입력해주세요");
                copyChangeInput.money = null; //내용 삭제
                setChangeInput(copyChangeInput);
            }else {
                /*if
                * 1. 수입 or 지출 하나의 버튼에라도 true가 있을 경우
                * 2. changeInput.money가 null이 아닌경우
                * */
                copySaveField.id += 1;
                copySaveField.typeButton.income.isActive = clickType.typeButton.income.isActive;
                copySaveField.typeButton.export.isActive = clickType.typeButton.export.isActive;
                copySaveField.category.id = categoryIsActive !== undefined && isViewCategory.first ? categoryIsActive.id : null;
                copySaveField.money = changeInput.money;
                copySaveField.memo = changeInput.memo;
                setSaveField(copySaveField);
                listArrangement(copySaveField); //List.tsx로 이동

                mathSum(todayTime, copySaveField);

                /* 1.보내기 성공 후 값 초기화
                    1-1. copySaveField.typeButton
                    1-2. changeInput
                    1-3. category
                2. 값 넣기
                    2-1. copySaveField.id
            * */
                const copyClickType = {...clickType, typeButton: {...clickType.typeButton, income: {...clickType.typeButton.income}, export: {...clickType.typeButton.export}, }};

                copyClickType.typeButton.income.isActive = false;
                copyClickType.typeButton.export.isActive = false;
                setClickType(copyClickType);

                copyChangeInput.money = null;
                copyChangeInput.memo = "";
                setChangeInput(copyChangeInput);
            }
        }}>
            <div className="relative rounded-[2.083vw] bg-[rgba(255,255,255,.7)] shadow-lg">
            {/* 새 입력 버튼 */}
                <button type="submit" className={`
                w-[2.865vw] h-[2.865vw] absolute top-[-0.625vw] left-[-0.729vw] cursor-pointer rounded-full bg-[#FF5858] duration-700 origin-center
                hover:rotate-[180deg] ${isSubmitButton ? "rotate-[180deg]" : null}
                after:content-['+'] after:absolute after:top-[42%] after:left-1/2 after:text-[#ffffff] after:text-[3.333vw] after:font-light after:translate-x-[-50%] after:translate-y-[-50%]
                `}></button>
                {/* 금일 일자 wrap */}
                <div className="w-[100%] inline-block pt-[0.625vw] px-[1.25vw] text-right">
                    <p className="text-[#999999] text-[3.333vw] leading-[110%] font-normal">{moment().format("DD")}</p>
                </div>
                {/* 수입&지출 버튼 및 금액 wrap */}
                <div className="flex justify-center pt-[1.25vw] px-[1.771vw]">
                    {/* 수입&지출 버튼 */}
                    <ul className="flex gap-[0.26vw] mr-[0.729vw]">
                        {Object.keys(clickType.typeButton).map((key, index)=>{
                            const typeKey = key as keyof (typeof clickType)["typeButton"];

                            return (<li key={index}><button type="button"
                                                            className={`px-[0.729vw] py-[0.26vw] cursor-pointer text-[0.729vw] font-normal rounded-[1.042vw] duration-150 hover:text-[#000000]
                                                            ${!clickType.typeButton[typeKey].isActive ? "text-[#575757] bg-[#D4D4D4]" : activePalette[typeKey].button }`}
                                                            onClick={(event)=>{
                                                                event.preventDefault();
                                                                const copyClickType = {...clickType, typeButton: {...clickType.typeButton, income: {...clickType.typeButton.income}, export: {...clickType.typeButton.export}, }};
                                                                const typeButton = copyClickType.typeButton;

                                                                if(!typeButton[typeKey].isActive){
                                                                    //클릭한 [typeKey].isActive 값이 false 일 경우
                                                                    Object.keys(copyClickType.typeButton).map((element)=>{
                                                                        const copyTypeKey = element as keyof (typeof saveField)["typeButton"];
                                                                        return typeButton[copyTypeKey].isActive = false; //income, export의 isActive 값 false로 (다른 버튼 true일 경우를 대비하여 모두 false시킴)
                                                                    });
                                                                    typeButton[typeKey].isActive = true;//클릭한 것만 true
                                                                }else {
                                                                    typeButton[typeKey].isActive = false; //다시 클릭했을 경우 false;
                                                                }

                                                                setClickType(copyClickType);
                            }}>{clickType.typeButton[typeKey].KoreaName}</button></li>)
                        })}
                    </ul>
                    {/* 금액 */}
                    <div className="flex items-center mt-[0.26vw]">
                        <input type="text" className={`w-[4.688vw] rounded-[0.26vw] text-[1.25vw] text-right leading-[110%] ${clickType.typeButton.income.isActive ? activePalette.income.text : clickType.typeButton.export.isActive ? activePalette.export.text : "text-[#000000]" }`} value={changeInput.money === null ? "" : changeInput.money} onChange={(event) => {
                            const copyChangeInput = {...changeInput};
                            const changeText = event.target.value.replace(/[^0-9]/g, "");
                            if(event.target.value !== "-"){
                                copyChangeInput.money = changeText;
                            }

                            setChangeInput(copyChangeInput);
                        }} onBlur={()=>{
                            const copyChangeInput = {...changeInput};
                            const changeMoney = copyChangeInput.money;

                            if(changeMoney !== null){
                                copyChangeInput.money = changeMoney.replace(/\B(?=(\d{3})+(?!\d))/g, ",");//세자리마다 쉼표 삽입

                                setChangeInput(copyChangeInput);
                            }
                        }}/>
                        <p className={`text-[1.25vw] leading-[110%] ${clickType.typeButton.income.isActive ? activePalette.income.text : clickType.typeButton.export.isActive ? activePalette.export.text : "text-[#000000]" }`}>원</p>
                    </div>
                </div>
                {/* 카테고리 및 메모 wrap */}
                <div className="flex gap-[3.646vw] items-center justify-center relative mt-[1.25vw] ml-[1.771vw] pr-[1.771vw] pb-[1.25vw]">
                    <button type="button" className={`w-[0.729vw] h-[0.729vw] block rounded-full cursor-pointer ${!isViewCategory.first ? "bg-conic/decreasing from-violet-700 via-lime-300 to-violet-700" : null}`} style={{backgroundColor:isViewCategory.first && categoryIsActive !== undefined ? categoryIsActive.color : undefined}} onClick={()=>{
                        const copyIsViewCategory = {...isViewCategory};
                        copyIsViewCategory.first = true;
                        copyIsViewCategory.always = !copyIsViewCategory.always; //클릭할때마다 변경
                        setIsViewCategory(copyIsViewCategory);
                    }}></button>
                    <input type="text" className="w-[6.771vw] rounded-[0.26vw] text-[#000000]" placeholder="메모란..." value={changeInput.memo} onChange={(event) => {
                        const copyChangeInput = {...changeInput};
                        copyChangeInput.memo = event.target.value;

                        setChangeInput(copyChangeInput);
                    }}/>
                    {/* 카테고리 선택 창 */}
                    <div className={`${isViewCategory.always ? "block" : "hidden"} absolute top-[1.25vw] left-[0] rounded-[1.042vw] border border-[#E9E9E9] bg-[#ffffff] shadow-lg`}>
                        {/* 카테고리 색상 선택 */}
                        <ul className="flex gap-[0.26vw] px-[0.833vw] pt-[0.521vw] pb-[0.521vw]">
                            {category.map((element, index)=>{
                                return (<li key={index} className={`w-[0.833vw] h-[0.833vw] relative`}>
                                    <button type="button" className={`${element.isActive ? "w-[0.833vw] h-[0.833vw]" : "w-[0.521vw] h-[0.521vw]"} block absolute top-1/2 left-1/2 cursor-pointer rounded-full translate-x-[-50%] translate-y-[-50%] duration-150`} style={{backgroundColor: element.color}} onClick={()=>{
                                        categoryActiveChange(index);
                                    }}></button>
                                </li>)
                            })}
                        </ul>
                        <input type="text" className="w-[9.375vw] mx-[0.833vw] mt-[0.26vw] mb-[0.729vw] text-[#000000] text-[0.729vw]" value={categoryIsActive !== undefined ? categoryIsActive.name : undefined} onChange={(event) => {
                            categoryNameChange(event.target.value);
                        }}/>
                    </div>
                </div>
            </div>
        </form>
        {/* 리스트 */}
        <ul className="pt-[0.521vw]">
            {todayData !== undefined ? todayData.list.map((element, index)=>{
                if(!element.isDeleted){
                    const useObject = category.find((item)=>item.id === element.categoryID);

                    return (<li key={index} className="flex justify-between mt-[0.521vw] px-[1.25vw] py-[0.729vw] rounded-[2.083vw] bg-[rgba(255,255,255,.7)]">
                        {/* 카테고리, 메모 wrap */}
                        <div>
                            <p className="text-[#000000] text-[0.625vw]">{element.memo}</p>
                            <div className="flex pt-[0.26vw]">
                                <span className="w-[0.729vw] h-[0.729vw] block rounded-full" style={{backgroundColor: useObject !== undefined ? useObject.color : undefined}}></span>
                            </div>
                        </div>
                        {/* 금액, 닫기 wrap */}
                        <div className="flex items-center">
                            <p className={`${element.activeButton.income ? activePalette.income.text : activePalette.export.text } text-[0.833vw]`}>{element.money}원</p>
                            <div className="ml-[0.521vw]">
                                <button type="button" className="w-[0.833vw] block cursor-pointer text-[#8F8F8F] text-[0.729vw] duration-150 hover:text-[#000000]" onClick={()=>{
                                    const deleteQuestion = confirm("정말 삭제하시겠습니까?");

                                    if(deleteQuestion){
                                        //확인 버튼을 눌렀을 경우
                                        console.log(element);
                                        mathImsub(element);
                                        deleteItem(element.id);
                                    }else {
                                        //취소 버튼을 눌렀을 경우
                                    }
                                }}>X</button>
                            </div>
                        </div>
                    </li>)
                }
            }) : null}
        </ul>
    </div>)
}