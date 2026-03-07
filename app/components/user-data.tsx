import { getUserData } from "@/app/utils/user-utils";


async function UserData({ userId }: { userId: number }) {
  const userData = await getUserData(userId);
  const [year, month, day] = userData.dob.split("-").map((x) => parseInt(x, 10))
  const dob = new Date(year, month - 1, day).toLocaleDateString("nb-NO", {
    month: "long",
    day: "numeric",
    year: "numeric",
});
  return (
    <table className="text-left">
      <tbody>
        <tr>
          <td>Navn:</td>
          <td>{userData.name}</td>
        </tr>
        <tr>
          <td>WCA ID:</td>
          <td>{userData.wcaId}</td>
        </tr>
        <tr>
          <td>Epost:</td>
          <td>{userData.email}</td>
        </tr>
        <tr>
          <td>Fødselsdato:</td>
          <td>{dob}</td>
        </tr>
        <tr>
          <td>Er medlem i år:</td>
          <td>{userData.isMember ? "Ja" : "Nei"}</td>
        </tr>
      </tbody>
    </table>
  )
}

export default UserData;
