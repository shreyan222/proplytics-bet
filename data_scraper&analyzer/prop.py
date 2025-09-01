import pickle
class Prop:
    def __init__(self, player_name, position, stat_type, line_score, odds_type, team_name, league_id, game_id):
        self.player_name = player_name
        self.position = position
        self.stat_type = stat_type
        self.line_score = line_score
        self.odds_type = odds_type
        self.team_name = team_name
        self.league_id = league_id
        self.game_id = game_id
        self.L5 = []
        self.L10 = []
        self.L20 = []
        self.H2H1Y = []
        self.H2H2Y = []
        self.hitAmtL10 = 0
        self.hitAmtH2H1Y = 0
        self.hitAmtH2H2Y = 0
        self.matchup = 0
        self.history = []  # Store historical stats or performance
        self.score = 0     # Default score

    def add_performance_data(self, performance_data, category):
        """Adds performance data to the specified category: 'H2H', 'L5', 'L10', or 'L20'."""
        if category == "H2H1Y":
            self.H2H1Y = list(performance_data)
        elif category == "H2H2Y":
            self.H2H2Y = list(performance_data)
        elif category == "L5":
            self.L5 = list(performance_data)
        elif category == "L10":
            self.L10 = list(performance_data)
        elif category == "L20":
            self.L20 = list(performance_data)
        else:
            raise ValueError(f"Invalid category '{category}'. Must be one of: 'H2H1Y', 'H2H2Y', 'L5', 'L10', 'L20'")

    def calculate_score(self):
        """Calculates the score based on historical data and other factors."""
        if not self.history:
            return 0
        # Example scoring logic: Weighted average of performance vs. line
        avg_performance = sum(self.history) / len(self.history)
        line_diff = avg_performance - self.line_score
        confidence_factor = self._confidence_factor()
        self.score = (line_diff * confidence_factor) + self._odds_score()

    def _confidence_factor(self):
        """Compute a custom confidence factor (example)."""
        return 1.2 if self.odds_type == 'favorable' else 1.0

    def _odds_score(self):
        """Compute score based on odds (example)."""
        return 10 if self.odds_type == 'over' else -5

    def __repr__(self):
        return (f"Prop(player_name={self.player_name}, position={self.position}, stat_type={self.stat_type}, "
                f"line_score={self.line_score}, odds_type={self.odds_type}, team_name={self.team_name}, "
                f"league_id={self.league_id}, game_id={self.game_id}, score={self.score:.2f}, "
                f"L10={self.L10}, H2H1Y={self.H2H1Y}, H2H2Y={self.H2H2Y})")

def load_props_from_file(filename='nba_props.pkl'):
    try:
        with open(filename, 'rb') as f:
            props = pickle.load(f)
            return props
    except FileNotFoundError:
        print(f"{filename} not found.")
        return []


