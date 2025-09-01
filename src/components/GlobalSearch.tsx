import React, { useState, useEffect, useRef } from 'react'
import { Search, X, User, Trophy, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { usePropsData } from '@/hooks/usePropsData'
import { Prop } from '@/types/nba'

interface SearchResult {
  id: string
  type: 'player' | 'team' | 'prop'
  title: string
  subtitle?: string
  url: string
  prop?: Prop
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Get props data using the same hook as Dashboard
  const { data: allProps = [], isLoading: propsLoading } = usePropsData();

  // Search function using the same logic as Dashboard
  const searchItems = async (query: string): Promise<SearchResult[]> => {
    if (!query.trim()) return []
    
    const searchLower = query.toLowerCase()
    const results: SearchResult[] = []
    
    // Search through props using the same logic as Dashboard
    const filteredProps = allProps.filter(prop => {
      return prop.player_name.toLowerCase().includes(searchLower) ||
             prop.team.toLowerCase().includes(searchLower) ||
             prop.stat_type.toLowerCase().includes(searchLower) ||
             prop.position.toLowerCase().includes(searchLower)
    })
    
    // Convert props to search results
    filteredProps.forEach(prop => {
      // Add player result
      results.push({
        id: `player-${prop.player_id}`,
        type: 'player',
        title: prop.player_name,
        subtitle: `${prop.team} • ${prop.position}`,
        url: `/players/${prop.player_id}`,
        prop
      })
      
      // Add team result
      results.push({
        id: `team-${prop.team}`,
        type: 'team',
        title: prop.team,
        subtitle: 'NBA Team',
        url: `/players?team=${encodeURIComponent(prop.team)}`,
        prop
      })
      
      // Add prop result
      results.push({
        id: `prop-${prop.prop_id}`,
        type: 'prop',
        title: `${prop.player_name} ${prop.stat_type}`,
        subtitle: `${prop.team} • ${prop.odds_type} • Line: ${prop.line_score}`,
        url: `/best-props?player=${encodeURIComponent(prop.player_name)}&stat=${encodeURIComponent(prop.stat_type)}`,
        prop
      })
    })
    
    // Remove duplicates based on id
    const uniqueResults = results.filter((result, index, self) => 
      index === self.findIndex(r => r.id === result.id)
    )
    
    return uniqueResults.slice(0, 20) // Limit to 20 results
  }

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchValue.trim()) {
        setIsLoading(true)
        const searchResults = await searchItems(searchValue)
        setResults(searchResults)
        setIsLoading(false)
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [searchValue, allProps])

  const handleSelect = (result: SearchResult) => {
    navigate(result.url)
    setOpen(false)
    setSearchValue('')
  }

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        inputRef.current?.blur()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const getIcon = (type: string) => {
    switch (type) {
      case 'player':
        return <User className="h-4 w-4" />
      case 'team':
        return <Users className="h-4 w-4" />
      case 'prop':
        return <Trophy className="h-4 w-4" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'player':
        return 'Player'
      case 'team':
        return 'Team'
      case 'prop':
        return 'Prop'
      default:
        return 'Result'
    }
  }

  return (
    <div className="relative w-full max-w-md" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          placeholder="Search props, players, teams..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setOpen(true)}
          className="pl-10 bg-gray-700/50 border-gray-600 text-gray-200 placeholder:text-gray-400 focus:bg-gray-600/50 focus:border-gray-500"
        />
      </div>
      
      {open && (searchValue || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <Command>
            <CommandList>
                          {(isLoading || propsLoading) && (
              <div className="p-4 text-center text-sm text-gray-500">
                {propsLoading ? 'Loading data...' : 'Searching...'}
              </div>
            )}
                          {!isLoading && !propsLoading && results.length === 0 && searchValue && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
            {!isLoading && !propsLoading && results.length > 0 && (
                <>
                  <CommandGroup heading="Players">
                    {results.filter(r => r.type === 'player').map((result) => (
                      <CommandItem
                        key={result.id}
                        onSelect={() => handleSelect(result)}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        {getIcon(result.type)}
                        <div className="flex-1">
                          <div className="font-medium">{result.title}</div>
                          {result.subtitle && (
                            <div className="text-sm text-gray-500">{result.subtitle}</div>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                          {getTypeLabel(result.type)}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandGroup heading="Teams">
                    {results.filter(r => r.type === 'team').map((result) => (
                      <CommandItem
                        key={result.id}
                        onSelect={() => handleSelect(result)}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        {getIcon(result.type)}
                        <div className="flex-1">
                          <div className="font-medium">{result.title}</div>
                          {result.subtitle && (
                            <div className="text-sm text-gray-500">{result.subtitle}</div>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                          {getTypeLabel(result.type)}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandGroup heading="Props">
                    {results.filter(r => r.type === 'prop').map((result) => (
                      <CommandItem
                        key={result.id}
                        onSelect={() => handleSelect(result)}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        {getIcon(result.type)}
                        <div className="flex-1">
                          <div className="font-medium">{result.title}</div>
                          {result.subtitle && (
                            <div className="text-sm text-gray-500">{result.subtitle}</div>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                          {getTypeLabel(result.type)}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  )
} 