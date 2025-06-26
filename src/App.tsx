import Group from "./assets/component/Group.tsx";
import List from "./assets/component/List.tsx";

function App() {

  return (
    <>
        <div className="min-w-[100vw] min-h-[100vh] flex justify-center items-start pt-[10.938vw] bg-linear-185 from-[rgba(214,239,217,.5)]] via-[rgba(239,222,214,.5)] to-[rgba(203,218,239,.5)]">
            <Group></Group>
            <List></List>
        </div>
    </>
  )
}

export default App
