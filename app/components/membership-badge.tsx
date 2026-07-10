export default function MembershipBadge({ isMember }: { isMember: boolean }) {
  return isMember ? <IsMemberBadge /> : <NotMemberBadge />;
}

function IsMemberBadge() {
  return (
    <div className="bg-green-600 border-4 border-green-700 text-white rounded-xl p-4">
      <div className="text-2xl font-semibold">Aktivt medlemskap i NKF</div>
      <p>Medlemskapet varer ut inneværende kalenderår.</p>
    </div>
  );
}

function NotMemberBadge() {
  return (
    <div className="bg-red-600 border-4 border-red-700 text-white rounded-xl p-4">
      <div className="text-2xl font-semibold">Ingen medlemskap i NKF</div>
      <p>Medlemskapet følger kalenderåret og må fornyes hvert år.</p>
    </div>
  );
}
