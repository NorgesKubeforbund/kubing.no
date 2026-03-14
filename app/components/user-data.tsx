import { getUserData } from "@/app/utils/user-utils";


async function UserData({ userId }: { userId: number }) {
  const userData = await getUserData(userId);
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
          <td>
            {userData.dob.toLocaleDateString("nb-NO", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </td>
        </tr>
        <tr>
          <td>Adresse</td>
          <td>{userData.address ? `${userData.address.address}, ${userData.address.postCode} ${userData.address.postArea.toLocaleUpperCase("nb-NO")}` : "Ingen adresse registrert"}</td>
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
