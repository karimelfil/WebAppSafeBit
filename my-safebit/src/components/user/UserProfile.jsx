import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Shield, User, Check, Trash2 } from 'lucide-react';

const allergiesList = [
  'Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Wheat', 'Soy', 
  'Fish', 'Shellfish', 'Sesame', 'Mustard', 'Celery', 'Lupin'
];

const diseasesList = [
  'Diabetes', 'Celiac Disease', 'Lactose Intolerance', 
  'Irritable Bowel Syndrome (IBS)', 'Crohn\'s Disease',
  'Hypertension', 'High Cholesterol', 'GERD'
];

export function UserProfile() {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Personal Information (View & Edit)
  const [firstName, setFirstName] = useState('John');
  const [lastName, setLastName] = useState('Doe');
  const [email, setEmail] = useState('john.doe@email.com');
  const [phone, setPhone] = useState('+1 555-0101');
  const [dob, setDob] = useState('1990-05-15');
  const [gender, setGender] = useState('male');
  
  // Health Information
  const [selectedAllergies, setSelectedAllergies] = useState(['Peanuts', 'Shellfish']);
  const [selectedDiseases, setSelectedDiseases] = useState([]);
  const [isPregnant, setIsPregnant] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Delete account confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleSavePersonalInfo = () => {
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleSaveHealthInfo = () => {
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText !== 'DELETE') {
      alert('Please type DELETE to confirm account deletion');
      return;
    }
    // Handle account deletion here
    alert('Account deletion requested. This action cannot be undone.');
    setShowDeleteConfirm(false);
    setDeleteConfirmText('');
  };

  const toggleAllergy = (allergy) => {
    setSelectedAllergies(prev =>
      prev.includes(allergy)
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    );
  };

  const toggleDisease = (disease) => {
    setSelectedDiseases(prev =>
      prev.includes(disease)
        ? prev.filter(d => d !== disease)
        : [...prev, disease]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2>My Profile</h2>
        <p className="text-sm text-gray-600">Manage your personal information and health profile</p>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <Alert className="bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Your profile has been updated successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="view">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="view">
            <User className="h-4 w-4 mr-2" />
            Personal Information
          </TabsTrigger>
          <TabsTrigger value="manage">
            <Shield className="h-4 w-4 mr-2" />
            Account Management
          </TabsTrigger>
          <TabsTrigger value="delete">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Account
          </TabsTrigger>
        </TabsList>

        {/* View-Only Personal Information Tab */}
        <TabsContent value="view" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Your account information (read-only)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">First Name</Label>
                  <div className="text-base font-medium">{firstName}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Last Name</Label>
                  <div className="text-base font-medium">{lastName}</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Email Address</Label>
                <div className="text-base font-medium">{email}</div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Phone Number</Label>
                <div className="text-base font-medium">{phone}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Date of Birth</Label>
                  <div className="text-base font-medium">{formatDate(dob)}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Gender</Label>
                  <div className="text-base font-medium capitalize">{gender}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Management Tab */}
        <TabsContent value="manage" className="space-y-6">
          {/* Update Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Update Personal Information</CardTitle>
              <CardDescription>
                Update your basic account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editFirstName">First Name</Label>
                  <Input
                    id="editFirstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editLastName">Last Name</Label>
                  <Input
                    id="editLastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editEmail">Email Address</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editPhone">Phone Number</Label>
                <Input
                  id="editPhone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editDob">Date of Birth</Label>
                  <Input
                    id="editDob"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editGender">Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger id="editGender">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleSavePersonalInfo} className="w-full bg-green-600 hover:bg-green-700">
                Save Personal Information
              </Button>
            </CardContent>
          </Card>

          {/* Update Health Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Update Health Profile</CardTitle>
              <CardDescription>
                Manage your health information and dietary restrictions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-blue-50 border-blue-200">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Your health information is confidential and used only to provide you with safe meal recommendations.
                </AlertDescription>
              </Alert>

              <div>
                <h3 className="text-lg font-semibold mb-2">Allergies</h3>
                <p className="text-sm text-gray-600 mb-4">Select all allergies that apply to you</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {allergiesList.map(allergy => (
                    <div key={allergy} className="flex items-center space-x-2">
                      <Checkbox
                        id={`allergy-${allergy}`}
                        checked={selectedAllergies.includes(allergy)}
                        onCheckedChange={() => toggleAllergy(allergy)}
                      />
                      <label htmlFor={`allergy-${allergy}`} className="text-sm cursor-pointer">
                        {allergy}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Chronic Food-Related Diseases</h3>
                <p className="text-sm text-gray-600 mb-4">Select any chronic conditions you have</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {diseasesList.map(disease => (
                    <div key={disease} className="flex items-center space-x-2">
                      <Checkbox
                        id={`disease-${disease}`}
                        checked={selectedDiseases.includes(disease)}
                        onCheckedChange={() => toggleDisease(disease)}
                      />
                      <label htmlFor={`disease-${disease}`} className="text-sm cursor-pointer">
                        {disease}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {gender === 'female' && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Pregnancy Status</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    This helps us provide appropriate dietary recommendations
                  </p>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pregnancy"
                      checked={isPregnant}
                      onCheckedChange={(checked) => setIsPregnant(checked)}
                    />
                    <label htmlFor="pregnancy" className="text-sm cursor-pointer">
                      I am currently pregnant
                    </label>
                  </div>
                </div>
              )}

              <Button onClick={handleSaveHealthInfo} className="w-full bg-green-600 hover:bg-green-700">
                Save Health Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delete Account Tab */}
        <TabsContent value="delete" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Delete Account</CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-red-50 border-red-200">
                <Trash2 className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Warning:</strong> This action cannot be undone. All your data, including personal information, health profile, and meal history will be permanently deleted.
                </AlertDescription>
              </Alert>

              {!showDeleteConfirm ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    If you're sure you want to delete your account, click the button below to proceed with the confirmation.
                  </p>
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Proceed to Delete Account
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    To confirm account deletion, please type <strong>DELETE</strong> in the field below:
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="deleteConfirm">Type DELETE to confirm</Label>
                    <Input
                      id="deleteConfirm"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="DELETE"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmText('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="flex-1"
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== 'DELETE'}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account Permanently
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
