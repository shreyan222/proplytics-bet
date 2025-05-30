
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ClientConnection {
  id: string;
  socket: WebSocket;
  userId?: string;
  lastPing: number;
}

const connections = new Map<string, ClientConnection>();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  const connectionId = crypto.randomUUID();
  
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const connection: ClientConnection = {
    id: connectionId,
    socket,
    lastPing: Date.now()
  };

  socket.onopen = () => {
    console.log(`WebSocket connection opened: ${connectionId}`);
    connections.set(connectionId, connection);
    
    // Send initial connection confirmation
    socket.send(JSON.stringify({
      type: 'connection_established',
      connectionId,
      timestamp: new Date().toISOString()
    }));
  };

  socket.onmessage = async (event) => {
    try {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'authenticate':
          connection.userId = message.userId;
          console.log(`User authenticated: ${message.userId}`);
          break;
          
        case 'ping':
          connection.lastPing = Date.now();
          socket.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
          break;
          
        case 'subscribe_to_changes':
          // Send current prop counts
          await sendPropCounts(socket, supabaseClient);
          await sendActiveGames(socket, supabaseClient);
          break;
          
        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  };

  socket.onclose = () => {
    console.log(`WebSocket connection closed: ${connectionId}`);
    connections.delete(connectionId);
  };

  socket.onerror = (error) => {
    console.error(`WebSocket error for ${connectionId}:`, error);
    connections.delete(connectionId);
  };

  return response;
});

async function sendPropCounts(socket: WebSocket, supabase: any) {
  try {
    const { data: props, error } = await supabase
      .from('props')
      .select('odds_type');

    if (error) throw error;

    const counts = {
      standard: props?.filter((p: any) => p.odds_type === 'standard').length || 0,
      demon: props?.filter((p: any) => p.odds_type === 'demon').length || 0,
      goblin: props?.filter((p: any) => p.odds_type === 'goblin').length || 0,
      total: props?.length || 0
    };

    socket.send(JSON.stringify({
      type: 'prop_counts_update',
      data: counts,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error sending prop counts:', error);
  }
}

async function sendActiveGames(socket: WebSocket, supabase: any) {
  try {
    const { data: games, error } = await supabase
      .from('games')
      .select('id, start_time, home_team:home_team_id(abbreviation), away_team:away_team_id(abbreviation)')
      .gte('start_time', new Date().toISOString());

    if (error) throw error;

    socket.send(JSON.stringify({
      type: 'active_games_update',
      data: {
        games: games || [],
        count: games?.length || 0
      },
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error sending active games:', error);
  }
}

// Broadcast updates to all connected clients
export function broadcastUpdate(message: any) {
  const messageString = JSON.stringify({
    ...message,
    timestamp: new Date().toISOString()
  });

  connections.forEach((connection) => {
    if (connection.socket.readyState === WebSocket.OPEN) {
      try {
        connection.socket.send(messageString);
      } catch (error) {
        console.error(`Error sending to connection ${connection.id}:`, error);
        connections.delete(connection.id);
      }
    }
  });
}

// Cleanup stale connections
setInterval(() => {
  const now = Date.now();
  const timeout = 5 * 60 * 1000; // 5 minutes

  connections.forEach((connection, id) => {
    if (now - connection.lastPing > timeout) {
      console.log(`Removing stale connection: ${id}`);
      connection.socket.close();
      connections.delete(id);
    }
  });
}, 60000); // Check every minute
