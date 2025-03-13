
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from '../hooks/use-toast';

export function StudentForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    studentId: '',
    department: 'Informatique',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { registerStudent } = useAuth();
  const { toast } = useToast();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create username from email (before the @)
    const username = formData.email.split('@')[0];
    
    setIsSubmitting(true);
    
    try {
      const success = await registerStudent({
        ...formData,
        username,
      });
      
      if (success) {
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          studentId: '',
          department: 'Informatique',
          password: '',
        });
        setIsOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="bg-[#9b87f5] hover:bg-[#8571e0] flex items-center gap-2">
          <span className="rounded-full bg-white h-5 w-5 flex items-center justify-center text-[#9b87f5]">+</span>
          Ajouter un étudiant
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="flex items-center justify-between">
          <SheetTitle className="text-xl">Ajouter un nouvel étudiant</SheetTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsOpen(false)}
            className="absolute right-4 top-4"
          >
            <X className="h-4 w-4" />
          </Button>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nom complet</Label>
            <Input
              id="fullName"
              name="firstName"
              placeholder="Nom et prénom"
              value={`${formData.firstName} ${formData.lastName}`}
              onChange={(e) => {
                const parts = e.target.value.split(' ');
                if (parts.length > 1) {
                  const firstName = parts[0];
                  const lastName = parts.slice(1).join(' ');
                  setFormData(prev => ({
                    ...prev,
                    firstName,
                    lastName
                  }));
                } else {
                  setFormData(prev => ({
                    ...prev,
                    firstName: parts[0],
                    lastName: ''
                  }));
                }
              }}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="studentId">ID Étudiant</Label>
            <Input
              id="studentId"
              name="studentId"
              placeholder="ET2024XXX"
              value={formData.studentId}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="department">Département</Label>
            <Input
              id="department"
              name="department"
              placeholder="Informatique"
              value={formData.department}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="etudiant@iset.tn"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Mot de passe pour l'étudiant"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-[#9b87f5] hover:bg-[#8571e0]" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Ajout en cours..." : "Ajouter"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
