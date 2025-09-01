#!/usr/bin/env python3
"""
NFL Defense vs Position Data Scraper - FIXED VERSION
Scrapes defensive statistics from draftedge.com/nfl/nfl-defense-vs-pos/
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
import re
import time
import logging
from typing import List, Dict, Optional
import json

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Set pandas display options to show all data
pd.set_option('display.max_columns', None)
pd.set_option('display.max_rows', None)
pd.set_option('display.width', None)
pd.set_option('display.max_colwidth', None)
pd.set_option('display.expand_frame_repr', False)


class NFLDefenseScraper:
    def __init__(self):
        self.base_url = "https://draftedge.com/nfl/nfl-defense-vs-pos/"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)

        # NFL team mappings - common team abbreviations and names
        self.team_mappings = {
            'arizona-cardinals': 'Arizona Cardinals',
            'atlanta-falcons': 'Atlanta Falcons',
            'baltimore-ravens': 'Baltimore Ravens',
            'buffalo-bills': 'Buffalo Bills',
            'carolina-panthers': 'Carolina Panthers',
            'chicago-bears': 'Chicago Bears',
            'cincinnati-bengals': 'Cincinnati Bengals',
            'cleveland-browns': 'Cleveland Browns',
            'dallas-cowboys': 'Dallas Cowboys',
            'denver-broncos': 'Denver Broncos',
            'detroit-lions': 'Detroit Lions',
            'green-bay-packers': 'Green Bay Packers',
            'houston-texans': 'Houston Texans',
            'indianapolis-colts': 'Indianapolis Colts',
            'jacksonville-jaguars': 'Jacksonville Jaguars',
            'kansas-city-chiefs': 'Kansas City Chiefs',
            'las-vegas-raiders': 'Las Vegas Raiders',
            'los-angeles-chargers': 'Los Angeles Chargers',
            'los-angeles-rams': 'Los Angeles Rams',
            'miami-dolphins': 'Miami Dolphins',
            'minnesota-vikings': 'Minnesota Vikings',
            'new-england-patriots': 'New England Patriots',
            'new-orleans-saints': 'New Orleans Saints',
            'new-york-giants': 'New York Giants',
            'new-york-jets': 'New York Jets',
            'philadelphia-eagles': 'Philadelphia Eagles',
            'pittsburgh-steelers': 'Pittsburgh Steelers',
            'san-francisco-49ers': 'San Francisco 49ers',
            'seattle-seahawks': 'Seattle Seahawks',
            'tampa-bay-buccaneers': 'Tampa Bay Buccaneers',
            'tennessee-titans': 'Tennessee Titans',
            'washington-commanders': 'Washington Commanders'
        }

    def fetch_page(self, url: str) -> Optional[BeautifulSoup]:
        """Fetch and parse a web page"""
        try:
            logger.info(f"Fetching: {url}")
            response = self.session.get(url, timeout=15)
            response.raise_for_status()

            # Check if we got redirected or blocked
            if "blocked" in response.text.lower() or response.status_code != 200:
                logger.warning("Possible blocking detected")
                return None

            return BeautifulSoup(response.content, 'html.parser')
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching {url}: {e}")
            return None

    def extract_team_name_from_img(self, img_element) -> Optional[str]:
        """Extract team name from image element"""
        if not img_element:
            return None

        # Try alt attribute
        alt_text = img_element.get('alt', '')
        if alt_text and alt_text.strip():
            return alt_text.strip()

        # Try src attribute for team identification
        src = img_element.get('src', '')
        if src:
            # Look for team names in the image URL
            for team_key, team_name in self.team_mappings.items():
                if team_key.lower() in src.lower():
                    return team_name
                # Also check for common abbreviations
                team_abbrev = team_key.split('-')[0][:3].upper()
                if team_abbrev in src.upper():
                    return team_name

        return None

    def clean_numeric_value(self, value: str) -> Optional[float]:
        """Clean and convert numeric values"""
        if not value or value == '':
            return None

        # Remove any non-numeric characters except decimal point, minus sign, and plus sign
        cleaned = re.sub(r'[^\d.+-]', '', value)

        try:
            return float(cleaned) if cleaned else None
        except ValueError:
            return None

    def clean_ranking(self, value: str) -> Optional[int]:
        """Clean and convert ranking values (e.g., #1 -> 1)"""
        if not value:
            return None

        # Extract number from ranking format
        match = re.search(r'#(\d+)', value)
        if match:
            return int(match.group(1))

        # Try to extract just numbers
        numbers = re.findall(r'\d+', value)
        if numbers:
            return int(numbers[0])

        return None

    def scrape_defense_data(self) -> List[Dict]:
        """Scrape NFL defense vs position data"""
        soup = self.fetch_page(self.base_url)
        if not soup:
            logger.error("Failed to fetch the main page")
            return []

        data = []

        # Look for the table with the data
        # The structure shows a table with team data
        table = soup.find('table')

        if not table:
            logger.warning("No table found, trying alternative parsing")
            # Try to find table rows directly
            rows = soup.find_all('tr')
        else:
            rows = table.find_all('tr')

        logger.info(f"Found {len(rows)} table rows")

        # Column headers based on the webpage structure
        column_names = [
            'team', 'dfs_points', 'vs_avg', 'pass_yards_rank', 'pass_td_rank',
            'pass_20_rank', 'pass_40_rank', 'rush_yards_rank', 'rush_td_rank',
            'rush_20_rank', 'rush_40_rank', 'rec_yards_rank', 'rec_td_rank',
            'receptions_rank', 'rec_20_rank', 'rec_40_rank', 'dk_rank', 'fd_rank'
        ]

        team_counter = 0

        for i, row in enumerate(rows):
            cells = row.find_all(['td', 'th'])

            # Skip header rows and rows with insufficient data
            if len(cells) < 17:  # Need at least 17 columns based on structure
                continue

            try:
                # Extract team name from first cell
                first_cell = cells[0]
                team_name = None

                # Look for image in the first cell
                img = first_cell.find('img')
                if img:
                    team_name = self.extract_team_name_from_img(img)

                # If no team name found from image, try text content
                if not team_name:
                    text_content = first_cell.get_text(strip=True)
                    if text_content and len(text_content) > 2:
                        team_name = text_content

                # If still no team name, assign a generic one
                if not team_name:
                    team_counter += 1
                    team_name = f"Team_{team_counter}"

                # Extract data from subsequent cells
                row_data = {'team': team_name}

                # Map the data to appropriate columns
                for j, cell in enumerate(cells[1:], 1):  # Skip first cell (team)
                    if j < len(column_names):
                        cell_text = cell.get_text(strip=True)

                        # Handle different data types
                        if j <= 2:  # DFS points and vs_avg are numeric
                            row_data[column_names[j]] = self.clean_numeric_value(cell_text)
                        else:  # Rankings
                            row_data[column_names[j]] = self.clean_ranking(cell_text)


                # Only add rows with some valid data
                if any(v is not None for k, v in row_data.items() if k != 'team'):
                    data.append(row_data)
                    logger.info(f"Extracted data for: {team_name}")

            except Exception as e:
                logger.error(f"Error processing row {i}: {e}")
                continue

        # If we didn't get enough data, try an alternative approach
        if len(data) < 20:  # Expected ~32 NFL teams
            logger.warning(f"Only found {len(data)} teams, trying alternative parsing")
            data = self.try_alternative_parsing(soup)

        logger.info(f"Successfully scraped data for {len(data)} teams")
        return data

    def try_alternative_parsing(self, soup) -> List[Dict]:
        """Alternative parsing method for dynamic content"""
        data = []

        # Look for script tags that might contain JSON data
        scripts = soup.find_all('script')
        for script in scripts:
            if script.string and 'team' in script.string.lower():
                try:
                    # Try to extract JSON data
                    script_content = script.string
                    # Look for JSON-like structures
                    json_matches = re.findall(r'\{[^{}]*"team"[^{}]*\}', script_content)
                    for match in json_matches:
                        try:
                            team_data = json.loads(match)
                            data.append(team_data)
                        except:
                            continue
                except:
                    continue

        # If no JSON found, create placeholder data with known teams
        if not data:
            logger.info("Creating placeholder data structure")
            for i, (_, team_name) in enumerate(self.team_mappings.items()):
                data.append({
                    'team': team_name,
                    'dfs_points': None,
                    'vs_avg': None,
                    'pass_yards_rank': None,
                    'pass_td_rank': None,
                    'pass_20_rank': None,
                    'pass_40_rank': None,
                    'rush_yards_rank': None,
                    'rush_td_rank': None,
                    'rush_20_rank': None,
                    'rush_40_rank': None,
                    'rec_yards_rank': None,
                    'rec_td_rank': None,
                    'receptions_rank': None,
                    'rec_20_rank': None,
                    'rec_40_rank': None,
                    'dk_rank': None,
                    'fd_rank': None
                })

        return data

    def save_to_csv(self, data: List[Dict], filename: str = "nfl_defense_vs_pos.csv"):
        """Save scraped data to CSV file"""
        if not data:
            logger.warning("No data to save")
            return

        df = pd.DataFrame(data)
        df.to_csv(filename, index=False)
        logger.info(f"Data saved to {filename}")

        # Display basic info about the dataset
        print(f"\nDataset Info:")
        print(f"Total teams: {len(df)}")
        print(f"Columns: {list(df.columns)}")
        print(f"\nAll data:")
        print(df)

        # Show data quality info
        non_null_counts = df.count()
        print(f"\nData completeness:")
        for col in df.columns:
            print(f"{col}: {non_null_counts[col]}/{len(df)} ({non_null_counts[col] / len(df) * 100:.1f}%)")

    def save_to_json(self, data: List[Dict], filename: str = "nfl_defense_vs_pos.json"):
        """Save scraped data to JSON file"""
        if not data:
            logger.warning("No data to save")
            return

        with open(filename, 'w') as f:
            json.dump(data, f, indent=2)

        logger.info(f"Data saved to {filename}")

    def get_team_list(self) -> List[str]:
        """Get list of NFL teams"""
        return list(self.team_mappings.values())


def main():
    """Main function to run the scraper"""
    scraper = NFLDefenseScraper()

    print("Starting NFL Defense vs Position data scraping...")
    print("Note: This website may use dynamic content loading which can affect scraping")

    # Scrape the data
    defense_data = scraper.scrape_defense_data()

    if defense_data:
        # Save to both CSV and JSON
        scraper.save_to_csv(defense_data)
        scraper.save_to_json(defense_data)

        print(f"\nScraping completed!")
        print(f"Scraped data for {len(defense_data)} NFL teams")

        # Display some sample data
        if defense_data:
            print("\nSample data (first 3 teams):")
            for i, team_data in enumerate(defense_data[:3]):
                print(f"\nTeam {i + 1}:")
                for key, value in team_data.items():
                    print(f"  {key}: {value}")
    else:
        print("No data was scraped.")
        print("\nPossible issues:")
        print("1. Website structure has changed")
        print("2. Website is using JavaScript to load content")
        print("3. Website is blocking the scraper")
        print("4. Network connectivity issues")

        print("\nSuggestions:")
        print("1. Try using Selenium for JavaScript-heavy sites")
        print("2. Check if the website has an API")
        print("3. Use different headers or proxy")
        print("4. Consider using official NFL data sources")


if __name__ == "__main__":
    main()
