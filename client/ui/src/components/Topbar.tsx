export default function Topbar() {
  return (
    <div className="fixed h-20 left-0 top-0 w-full p-4 bg-white duration-200 flex items-center z-[997]">
      <div className="ml-auto p-0 list-none flex">
        <button type="button" className="inline-flex justify-center items-center relative text-gray-600 rounded-full w-12 h-12 cursor-pointer duration-200">
          <i className="pi pi-calendar"></i>
        </button>
        <button type="button" className="inline-flex justify-center items-center relative text-gray-600 rounded-full w-12 h-12 cursor-pointer duration-200">
          <i className="pi pi-cog"></i>
        </button>
        <button type="button" className="inline-flex justify-center items-center relative text-gray-600 rounded-full w-12 h-12 cursor-pointer duration-200">
          <i className="pi pi-user"></i>
        </button>
      </div>
    </div>
  );
}