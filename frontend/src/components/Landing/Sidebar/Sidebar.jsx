import sidebarData from "../../../utils/sidebarData";

function Sidebar() {
  return (
    <div
      style={{
        width: "250px",
        minHeight: "100vh",
        borderRight: "1px solid #ddd",
        padding: "20px"
      }}
    >
      <Link to="/" className="logo">
        Zyoro AI
      </Link>

      <hr />

      {sidebarData.map((item) => (
        <div
          key={item.id}
          style={{
            margin: "20px 0",
            cursor: "pointer",
          }}
        >
          {item.name}
        </div>
      ))}
    </div>
  );
}

export default Sidebar;
