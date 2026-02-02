import { Zap } from 'lucide-react'


const Header = () => {
  return (
    <header className="border-b border-border/50 backdrop-blur-md bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                 <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-secondary flex items-center justify-center">
                    <Zap className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-success animate-pulse" />
                 </div>
                 <div>
                  <h1 className="font-bold text-xl gradient-text">YellowFaucet</h1>
                  <p className="text-xs text-muted-foreground">Powered by Yellow Network</p>
                 </div>
                </div>
            </div>
        </div>
    </header>
  )
}

export default Header