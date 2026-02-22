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
          <td>{userData.dob}</td>
        </tr>
      </tbody>
    </table>
  )
}

export default UserData;
