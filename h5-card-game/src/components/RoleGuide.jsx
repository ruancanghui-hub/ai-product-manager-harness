import { Briefcase, ChatCenteredText, ListChecks } from "@phosphor-icons/react";

export function RoleGuide({ profile, variant = "compact" }) {
  const isFull = variant === "full";

  return (
    <section className={`role-guide role-guide--${variant}`}>
      <div className="role-guide__heading">
        <Briefcase size={21} weight="duotone" />
        <h3>岗位详细介绍</h3>
      </div>
      <p className="role-guide__summary">{profile.summary}</p>

      <section className="role-guide__section">
        <h4><ListChecks size={18} weight="bold" /> 日常能帮你做什么</h4>
        <ul>
          {profile.dailyWork.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      {isFull ? (
        <>
          <section className="role-guide__section">
            <h4><Briefcase size={18} weight="bold" /> 如何让他使用这些能力</h4>
            <ol>
              {profile.howToUse.map((item) => <li key={item}>{item}</li>)}
            </ol>
          </section>
          <section className="role-guide__prompt">
            <h4><ChatCenteredText size={19} weight="fill" /> 可直接使用的召唤口令</h4>
            <p>{profile.promptExample}</p>
          </section>
        </>
      ) : null}
    </section>
  );
}

