define([
    'superdesk-users/directives'
], function() {
    'use strict';

    var template = [
        '<form name="userForm">',
        '<input type="text" name="username" sd-user-unique data-unique-field="userName" data-exclude="user" ng-model="user.userName">',
        '</form>'
    ].join('');

    describe('sdUserUnique Directive', function() {

        beforeEach(module(function($provide) {
            $provide.service('resource', function($q) {
                this.users = {
                    // make it find foo but not any other
                    query: function(criteria) {
                        if (criteria.userName === 'foo') {
                            return $q.when({
                                total: 1,
                                _items: [{Id: 9}]
                            });
                        } else {
                            return $q.when({total: 0});
                        }
                    }
                };
            });
        }));

        beforeEach(module('superdesk.users.directives'));

        it('validates that field is unique', inject(function($rootScope, $compile) {
            var scope = $rootScope.$new(true);
            scope.user = {Id: 3, userName: 'test'};

            $compile(template)(scope);

            scope.$eval('userForm.username.$setViewValue("foo")');
            scope.$digest();

            expect(scope.$eval('userForm.username.$dirty')).toBe(true);
            expect(scope.$eval('userForm.username.$valid')).toBe(false);
            expect(scope.$eval('userForm.username.$error.unique')).toBe(true);

            scope.$apply(function() {
                scope.user = {Id: 6, userName: 'baz'};
            });

            expect(scope.$eval('userForm.username.$valid')).toBe(true);

            scope.$eval('userForm.username.$setViewValue("bar")');
            scope.$digest();

            expect(scope.$eval('userForm.username.$valid')).toBe(true);
            expect(scope.$eval('userForm.username.$error.unique')).toBe(false);
            expect(scope.$eval('userForm.username.$modelValue')).toBe('bar');

            scope.$apply(function() {
                scope.user = {Id: 9, userName: 'foo'};
            });

            expect(scope.$eval('userForm.username.$valid')).toBe(true);

            scope.$eval('userForm.username.$setViewValue("foo")');
            scope.$digest();

            expect(scope.$eval('userForm.username.$valid')).toBe(true);
            expect(scope.$eval('userForm.username.$error.unique')).toBe(false);
            expect(scope.$eval('userForm.username.$modelValue')).toBe('foo');
        }));
    });
});
