const features = [
  ["🏏", "Live Scoring", "Ball-by-ball scoring with scorecards, overs, wickets and match events."],
  ["👤", "Player Profiles", "Career records that update automatically from every completed match."],
  ["👥", "Teams & Requests", "Create a team, join existing teams and manage player requests."],
  ["📊", "Smart Statistics", "Runs, average, strike rate, wickets, economy and recent form."],
  ["🔔", "Match Updates", "Keep players connected with match and team notifications."],
  ["🌐", "Built for Everyone", "A clean, responsive cricket experience ready for multilingual support."],
];

export default function Home() {
  return (
    <main className="page">
      <nav className="nav">
        <div className="logo">Boss<span>live</span> 🏏</div>
        <div className="navlinks"><a href="#home">Home</a><a href="#features">Features</a><a href="#teams">Teams</a><a href="#players">Players</a></div>
        <button className="login">Login</button>
      </nav>

      <section className="hero" id="home">
        <div>
          <div className="badge">● THE NEXT CRICKET EXPERIENCE</div>
          <h1>Play. Score.<br/><span>Own your game.</span></h1>
          <p>Bosslive brings players, teams and live cricket scoring together. Build your team, play matches and let every performance become part of your cricket history.</p>
          <div className="actions"><button className="primary">Get Started →</button><button className="secondary">Explore Matches</button></div>
        </div>
        <div className="scorecard" aria-label="Live match preview">
          <div className="live">● LIVE MATCH</div>
          <div className="teams">
            <div className="team"><div className="teamicon">🟢</div><b>Boss Warriors</b><div className="score">146/4</div><div className="overs">17.2 overs</div></div>
            <div className="vs">VS</div>
            <div className="team"><div className="teamicon">🔵</div><b>Campus Kings</b><div className="score">—</div><div className="overs">Yet to bat</div></div>
          </div>
          <div style={{borderTop:"1px solid #ffffff12",paddingTop:16,color:"#9aa8b8",fontSize:13}}>Vikash Kumar <strong style={{color:"#fff"}}>42 (27)</strong> • 4s 5 • 6s 2</div>
        </div>
      </section>

      <section className="section" id="features">
        <h2>Everything cricket needs.</h2><div className="sub">From your first team to your hundredth match.</div>
        <div className="cards">{features.map(([icon,title,text])=><article className="card" key={title}><div className="icon">{icon}</div><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>
    </main>
  );
}