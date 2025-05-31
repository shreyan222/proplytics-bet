
import { useQuery } from '@tanstack/react-query';

// Mock data structure matching the Python script output
const mockTrackerData = {
  total_active: 156,
  new_props: [
    {
      "Prop ID": "12345",
      "Display Name": "LeBron James",
      "Team Name": "LAL",
      "Position": "SF",
      "Stat Type": "Points",
      "Line Score": 28.5,
      "Odds Type": "standard",
      "Start Time": "2024-01-15T20:00:00Z"
    },
    {
      "Prop ID": "12346",
      "Display Name": "Stephen Curry",
      "Team Name": "GSW",
      "Position": "PG",
      "Stat Type": "3-Pointers Made",
      "Line Score": 4.5,
      "Odds Type": "demon",
      "Start Time": "2024-01-15T20:00:00Z"
    },
    {
      "Prop ID": "12347",
      "Display Name": "Giannis Antetokounmpo",
      "Team Name": "MIL",
      "Position": "PF",
      "Stat Type": "Rebounds",
      "Line Score": 11.5,
      "Odds Type": "goblin",
      "Start Time": "2024-01-15T19:30:00Z"
    }
  ],
  removed_props: [
    {
      "Prop ID": "67890",
      "Display Name": "Jayson Tatum",
      "Team Name": "BOS",
      "Position": "SF",
      "Stat Type": "Points",
      "Line Score": 26.5,
      "Odds Type": "standard",
      "Start Time": "2024-01-15T19:30:00Z",
      "Removed At": "2024-01-15T18:45:00Z"
    }
  ],
  changed_props: [
    {
      "Prop ID": "11111",
      "Player": "Luka Dončić",
      "Team": "DAL",
      "Position": "PG",
      "Stat Type": "Assists",
      "Odds Type": "standard",
      "Start Time": "2024-01-15T21:00:00Z",
      "Changes": {
        "Line Score": {
          "previous": 8.5,
          "current": 9.0
        }
      }
    },
    {
      "Prop ID": "22222",
      "Player": "Nikola Jokić",
      "Team": "DEN",
      "Position": "C",
      "Stat Type": "Double-Double",
      "Odds Type": "goblin",
      "Start Time": "2024-01-15T22:30:00Z",
      "Changes": {
        "Line Score": {
          "previous": 0.5,
          "current": 0.75
        }
      }
    }
  ],
  recent_activities: [
    {
      id: "act_1",
      type: "new" as const,
      player: "LeBron James",
      team: "LAL",
      statType: "Points",
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString()
    },
    {
      id: "act_2",
      type: "changed" as const,
      player: "Luka Dončić",
      team: "DAL",
      statType: "Assists",
      change: "line moved from 8.5 to 9.0",
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    },
    {
      id: "act_3",
      type: "removed" as const,
      player: "Jayson Tatum",
      team: "BOS",
      statType: "Points",
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString()
    },
    {
      id: "act_4",
      type: "new" as const,
      player: "Stephen Curry",
      team: "GSW",
      statType: "3-Pointers Made",
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    },
    {
      id: "act_5",
      type: "changed" as const,
      player: "Nikola Jokić",
      team: "DEN",
      statType: "Double-Double",
      change: "line moved from 0.5 to 0.75",
      timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString()
    }
  ]
};

export const useTrackerData = () => {
  return useQuery({
    queryKey: ['tracker-data'],
    queryFn: async () => {
      console.log('Fetching tracker data...');
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockTrackerData;
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};
